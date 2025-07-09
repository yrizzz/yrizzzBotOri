import NodeCache from '@cacheable/node-cache';
import pkg from 'baileys';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import P from 'pino';
import QRCode from 'qrcode';
import readline from 'readline';
import { pathToFileURL } from 'url';
import Function from './Function.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
ffmpeg.setFfmpegPath(ffmpegStatic);


process.setMaxListeners(0);

const {
    makeWASocket,
    delay,
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

        const sock = makeWASocket({
            version,
            logger,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            msgRetryCounterCache: this.msgRetryCounterCache,
            generateHighQualityLinkPreview: true,
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

                if (events['messages.upsert']) {
                    await this.upsertMessage(events)
                }
            }
        )

        this.sock = sock;
        return sock
    }

    async upsertMessage(events) {
        const upsert = events['messages.upsert']
        const messages = upsert.messages
        let clk = chalk.whiteBright;

        for (const msg of messages) {
            const type = await Function.messageEventType(msg);
            if (type === 'Update') {
                clk = chalk.blueBright
            } else if (type === 'Received') {
                clk = chalk.greenBright
            } else if (type === 'Delete') {
                clk = chalk.redBright
            }
            if (msg?.key?.participant?.endsWith('lid')) {
                const meta = m?.key.remoteJid?.endsWith('g.us') ? await this.sock.groupMetadata(m?.key.remoteJid) : null
                const lid = meta?.participants?.find(p => p?.id === msg.key.participant)
                msg.key.participant = typeof lid?.jid !== 'undefined' ? lid.jid : msg.key.participant;
            }
            console.log(clk(`[${type} Message] at ${new Date(msg.messageTimestamp * 1000).toLocaleString()}`))
            let log = `from: ${msg.key.remoteJid}\n`
            log += `participant: ${msg.key.participant || 'N/A'}\n`
            log += `fromMe: ${msg.key.fromMe}\n`
            log += `id: ${msg.key.id}\n`
            log += `type: ${Object?.keys(msg.message)[0]}\n`
            log += `message: ${await Function.messageContent(msg)}\n`
            console.log(log)
        }
    }

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
            for (const msg of upsert.messages) {
                console.log(msg.key.fromMe, this.selfMode)
                if (!msg.key.fromMe && this.selfMode) {
                    return;
                }
                const messageText = await Function.messageContent(msg);
                const ctx = async () => {
                    this.ctx = {
                        jid: await Function.jid(msg),
                        content: messageText,
                        messageType: `${Object?.keys(msg.message)[0]}`,
                        match: messageText.match(pattern),
                        args: messageText.split(' ').slice(1),
                        msg: msg,
                        reply: async (text) => this.reply(text, msg),
                        sendMessage: async (text) => this.sendMessage(text, msg),
                        react: async (text) => this.react(text, msg)
                    };
                    return callback(this.ctx);
                }

                if (type === 'hears' && messageText && pattern && pattern.test(messageText)) {
                    ctx()
                } else if (
                    type === 'command' &&
                    messageText &&
                    this.prefix.some(prefix => messageText.startsWith(prefix)) &&
                    messageText.match(pattern)
                ) {
                    ctx();
                }

                return;
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
        if (msg?.key?.participant?.endsWith('lid')) {
            const meta = m?.key.remoteJid?.endsWith('g.us') ? await this.sock.groupMetadata(m?.key.remoteJid) : null
            const lid = meta?.participants?.find(p => p?.id === msg.key.participant)
            msg.key.participant = typeof lid?.jid !== 'undefined' ? lid.jid : msg.key.participant;
        }
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

