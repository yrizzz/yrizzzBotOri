
import { downloadMediaMessage } from 'baileys'
export default class Function {
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async question(rl, text) {
        return new Promise((resolve) => rl.question(text, resolve));
    }

    static async messageContent(msg) {
        if (msg) {
            let message = msg.message;
            let type = message ? Object.keys(message)[0] : undefined;
            if (type === 'conversation' || type === 'extendedTextMessage' || type === 'senderKeyDistributionMessage') {
                return message.conversation || message?.extendedTextMessage?.text;
            } else if (type === 'imageMessage' || type === 'videoMessage') {
                return message[type].caption || '';
            } else if (type === 'documentMessage') {
                return message[type].fileName || '';
            } else if (type === 'locationMessage') {
                return `${message[type].degreesLatitude}, ${message[type].degreesLongitude}`;
            } else if (type === 'contactMessage') {
                return `${message[type].vcard}`;
            } else if (type === 'listMessage') {
                return message[type].description || '';
            } else if (type === 'buttonsResponseMessage') {
                return message[type].selectedButtonId || '';
            } else if (type === 'templateMessage') {
                return message[type].hydratedTemplate?.hydratedContentText || '';
            } else if (type === 'pollCreationMessage') {
                return message[type].pollCreationMessage.pollName || '';
            } else if (type === 'reactionMessage' || type === 'messageContextInfo') {
                return message[type].reactionMessage || '';
            } else if (type === 'stickerMessage') {
                return 'Sticker received';
            } else if (type === 'protocolMessage') {
                if (message[type]?.editedMessage?.conversation) {
                    return message[type].editedMessage?.conversation || 'Message edited';
                } else {
                    return 'Message deleted';
                }
            }
        }
        return null
    }

    static async jid(msg) {
        if (msg && msg.key && msg.key.remoteJid) {
            return msg.key.remoteJid;
        }
        return null;
    }

    static async messageEventType(msg) {

        let type = Object?.keys(msg?.message)[0] ?? null;
        if (msg?.message?.protocolMessage?.editedMessage) {
            return 'Update';
        } else if (type === 'protocolMessage') {
            return 'Delete';
        }

        return 'Received';
    }

    static async getMediaBuffer(ctx) {
        const getMediaMessage = (ctx) => {
            if (ctx.messageType === 'imageMessage') return ctx.msg.message.imageMessage;
            if (ctx.messageType === 'videoMessage') return ctx.msg.message.videoMessage;
            if (ctx.messageType === 'stickerMessage') return ctx.msg.message.stickerMessage;
            if (ctx.messageType === 'audioMessage') return ctx.msg.message.audioMessage;
            if (ctx.messageType === 'documentMessage') return ctx.msg.message.documentMessage;
            if (ctx.messageType === 'extendedTextMessage') {
                const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quoted) {
                    if (quoted.imageMessage) return quoted.imageMessage;
                    if (quoted.videoMessage) return quoted.videoMessage;
                    if (quoted.stickerMessage) return quoted.stickerMessage;
                    if (quoted.audioMessage) return quoted.audioMessage;
                    if (quoted.documentMessage) return quoted.documentMessage;
                }
            }
            return null;
        };

        const getDownloadableMessageObject = (messageType, mediaContent) => {
            if (!mediaContent) return null;
            const downloadableMessage = {
                message: {}
            };

            switch (messageType) {
                case 'imageMessage':
                    downloadableMessage.message.imageMessage = mediaContent;
                    break;
                case 'videoMessage':
                    downloadableMessage.message.videoMessage = mediaContent;
                    break;
                case 'stickerMessage':
                    downloadableMessage.message.stickerMessage = mediaContent;
                    break;
                case 'audioMessage':
                    downloadableMessage.message.audioMessage = mediaContent;
                    break;
                case 'documentMessage':
                    downloadableMessage.message.documentMessage = mediaContent;
                    break;
                default:
                    return false;
            }
            return downloadableMessage;
        };

        const mediaContent = await getMediaMessage(ctx);
        if (mediaContent) {
            let actualMessageType = ctx.messageType;
            if (ctx.messageType === 'extendedTextMessage') {
                const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quoted) {
                    if (quoted.imageMessage) actualMessageType = 'imageMessage';
                    else if (quoted.videoMessage) actualMessageType = 'videoMessage';
                    else if (quoted.stickerMessage) actualMessageType = 'stickerMessage';
                    else if (quoted.audioMessage) actualMessageType = 'audioMessage';
                    else if (quoted.documentMessage) actualMessageType = 'documentMessage';
                }
            }

            const downloadableObject = await getDownloadableMessageObject(actualMessageType, mediaContent);
            if (downloadableObject) {
                return await downloadMediaMessage(downloadableObject,'buffer');
            }
        }
        return false; 
    }


}