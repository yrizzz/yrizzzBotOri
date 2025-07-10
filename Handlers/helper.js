export default {
    filtermessage: (m, data) => {
        let result;
        if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;
        } else if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
        } else if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption;
        } else if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.caption) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.caption;
        } else {
            result = data;
        }

        return result;
    },
    isGroup: (jid) => {
        return jid && jid.endsWith('@g.us');
    },

    // A helper to determine if a JID is a user JID
    isUser: (jid) => {
        return jid && jid.endsWith('@s.whatsapp.net');
    },
    link: (text) => {
        // Regex to match URLs starting with http:// or https://
        // This pattern is quite comprehensive but not exhaustive for all URL cases.
        const urlRegex = /(?:(?:https?:\/\/)|(?:www\.)?)[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{0,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

        const match = text.match(urlRegex);

        if (match) {
            return match[0]; // match[0] contains the full string matched by the regex
        } else {
            return null; // No link found
        }
    }
};
