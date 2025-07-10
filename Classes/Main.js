import pkg from 'baileys';
import chalk from 'chalk';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import NodeCache from 'node-cache';
import path from 'path';
import P from 'pino';
import QRCode from 'qrcode';
import readline from 'readline';
import { pathToFileURL } from 'url';
import Function from './Function.js';
ffmpeg.setFfmpegPath(ffmpegStatic);

const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false }); // cache TTL 5 menit

const getCachedGroupMetadata = async (jid, sock) => {
    if (!jid.endsWith('@g.us')) return null;

    let cached = groupCache.get(jid);
    if (cached) return cached;

    try {
        const fresh = await sock.groupMetadata(jid);
        groupCache.set(jid, fresh);
        return fresh;
    } catch (err) {
        console.error('groupMetadata rate-limited or failed:', err?.output?.statusCode || err);
        return null;
    }
};

const {
    makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState
} = pkg

const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('./wa-logs.txt'))
logger.level = 'silent'

export class YrizzBot {
    constructor() {
        this.prefix = ['!', '#', '.'];
        this.selfMode = true
        this.usePairingCode = process.argv.includes('--use-pairing-code') ?? false
        this.msgRetryCounterCache = new NodeCache()
        this.onDemandMap = new Map()
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        this.sleep = ms => new Promise(res => setTimeout(res, ms));
        this.ctx = null;
        this.sock = null;
    }

    question(text) {
        return new Promise((resolve) => this.rl.question(text, resolve))
    }

    async startSock() {
        const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
        const { version, isLatest } = await fetchLatestBaileysVersion()
        console.log(chalk.bgGreen(`using WA v${version.join('.')}, isLatest: ${isLatest}`))
        const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
        const sock = makeWASocket({
            version,
            logger,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            msgRetryCounterCache: this.msgRetryCounterCache,
            generateHighQualityLinkPreview: true,
            cachedGroupMetadata: async (jid) => groupCache.get(jid)
        })

        if (this.usePairingCode && !sock.authState.creds.registered) {
            const phoneNumber = await this.question('Please enter your phone number:\n')
            const code = await sock.requestPairingCode(phoneNumber)
            console.log(`Pairing code: ${code}`)
        }

        sock.ev.process(
            async (events) => {
                if (events['connection.update']) {
                    const update = events['connection.update']
                    const { connection, lastDisconnect, qr } = update
                    if (qr) {
                        console.log(await QRCode.toString(qr, { type: 'terminal', small: true }))
                    }
                    if (connection === 'close') {
                        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                            this.startSock()
                        } else {
                            console.log('Connection closed. You are logged out.')
                        }
                    }
                }

                if (events['creds.update']) {
                    await saveCreds()
                }
            }
        )

        sock.ev.on('groups.update', async ([event]) => {
            const metadata = await sock.groupMetadata(event.id)
            groupCache.set(event.id, metadata)
        })

        sock.ev.on('group-participants.update', async (event) => {
            const metadata = await sock.groupMetadata(event.id)
            groupCache.set(event.id, metadata)
        })

        this.sock = sock;
        return sock
    }

    // async upsertMessage(events) {
    //     const upsert = events['messages.upsert']
    //     const messages = upsert.messages
    //     let clk = chalk.whiteBright;
    //     if (upsert.type === 'notify' || upsert.type === 'append') {
    //         for (const msg of messages) {

    //         }
    //     }
    // }

    async messageHandler(type, pattern, callback) {
        pattern = Array.isArray(pattern) ? pattern.join('|') : pattern
        pattern = pattern instanceof RegExp ? pattern : new RegExp(`^.${pattern}`, 'i');
        if (!this.sock) {
            throw new Error('Socket not initialized. Call start() first.');
        }
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function.');
        }

        this.sock.ev.on('messages.upsert', async (events) => {
            const upsert = events;
            if (events.type === 'notify' && events.type === 'append') {
                for (const msg of upsert.messages) {
                    const type = await Function.messageEventType(msg);
                    if (type === 'Update') {
                        clk = chalk.blueBright
                    } else if (type === 'Received') {
                        clk = chalk.greenBright
                    } else if (type === 'Delete') {
                        clk = chalk.redBright
                    }

                    let typeMessage = msg?.message && typeof msg.message === 'object' ? Object?.keys(msg.message)[0] : null;
                    console.log(clk(`[${type} Message] at ${new Date(msg.messageTimestamp * 1000).toLocaleString()}`))
                    let log = `from: ${msg.key.remoteJid}\n`
                    log += `participant: ${msg.key.participant || 'N/A'}\n`
                    log += `fromMe: ${msg.key.fromMe}\n`
                    log += `id: ${msg.key.id}\n`
                    log += `type: ${typeMessage}\n`
                    log += `message: ${await Function.messageContent(msg)}\n`
                    console.log(log)

                    let fromMe = msg.key.fromMe;
                    const messageText = await Function.messageContent(msg);

                    if (msg?.key?.participant?.endsWith('lid')) {
                        const meta = await getCachedGroupMetadata(msg?.key.remoteJid, this.sock); // PAKAI CACHE
                        const lid = meta?.participants?.find(p => p?.id === msg.key.participant);
                        msg.key.participant = lid?.jid || msg.key.participant;

                        const botId = this.sock.user.id.replace(/:\d+(@)/, "$1");
                        fromMe = botId === msg.key.participant;
                    }

                    if (!fromMe && this.selfMode) return;

                    const ctx = async () => {
                        this.ctx = {
                            jid: msg.key.participant ? msg.key.participant : msg.key.remoteJid,
                            content: messageText,
                            messageType: msg?.message && typeof msg.message === 'object' ? Object?.keys(msg.message)[0] : null,
                            match: messageText.match(pattern),
                            args: messageText.split(' ').slice(1),
                            msg: msg,
                            sock: this.sock,
                            reply: async (text) => this.reply(text, msg),
                            sendMessage: async (text) => this.sendMessage(text, msg),
                            react: async (text) => this.react(text, msg)
                        };
                        return callback(this.ctx);
                    };

                    if (type === 'hears' && messageText && pattern?.test(messageText)) {
                        ctx();
                    } else if (
                        type === 'command' &&
                        messageText &&
                        this.prefix.some(prefix => messageText.startsWith(prefix)) &&
                        messageText.match(pattern)
                    ) {
                        ctx();
                    }
                }
            }
        });
    }

    async hears(pattern, callback) {
        this.messageHandler('hears', pattern, callback);
    }

    async command(pattern, callback) {
        this.messageHandler('command', pattern, callback);
    }

    async reply(text, msg) {
        if (Array.isArray(text)) {
            await this.sock.sendMessage(msg.key.remoteJid, ...text);
        } else {
            await this.sock.sendMessage(msg.key.remoteJid, { text: text }, { quoted: msg, ephemeralExpiration: msg.message?.extendedTextMessage?.contextInfo?.expiration || 0 });
        }
    }

    async sendMessage(text, msg) {

        if (Array.isArray(text)) {
            await this.sock.sendMessage(msg.key.remoteJid, ...text);
        } else {
            await this.sock.sendMessage(msg.key.remoteJid, { text: text }, { ephemeralExpiration: msg.message?.extendedTextMessage?.contextInfo?.expiration || 0 });
        }
    }

    async react(text, msg) {
        await this.sock.sendMessage(msg.key.remoteJid, { react: { text: text, key: msg.key } }, { ephemeralExpiration: msg.message?.extendedTextMessage?.contextInfo?.expiration || 0 });
    }

    async start() {
        await this.startSock();
    }

    async loadCommands() {
        if (!this.sock) {
            throw new Error('Socket not initialized. Call start() first.');
        }

        const commandsDir = path.resolve('./Commands');

        function getJsFilesRecursively(dir) {
            let results = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    results = results.concat(getJsFilesRecursively(fullPath));
                } else if (entry.isFile() && entry.name.endsWith('.js')) {
                    results.push(fullPath);
                }
            }
            return results;
        }

        const files = getJsFilesRecursively(commandsDir);

        for (const filePath of files) {
            const fileUrl = pathToFileURL(filePath).href;
            let mod;
            try {
                mod = await import(fileUrl);
            } catch (err) {
                console.warn(chalk.red(`Failed to import ${filePath}:`), err);
                continue;
            }

            const command = mod?.default;

            if (!command || !command.name || !command.code || !command.type) {
                console.warn(chalk.yellow(`Skipping invalid command in: ${filePath}`));
                continue;
            }

            console.log(chalk.green(`Loading command: ${command.name}`));

            try {
                if (command.type === 'command') {
                    await this.command(command?.prefix ? command?.prefix : command.name, command.code);
                } else if (command.type === 'hears') {
                    await this.hears(command?.prefix ? command?.prefix : command.name, command.code);
                } else {
                    console.warn(chalk.red(`Unknown command type '${command.type}' in: ${filePath}`));
                }
            } catch (err) {
                console.error(chalk.red(`Failed to load command '${command.name}' from ${filePath}:`), err);
            }
        }
    }

}

