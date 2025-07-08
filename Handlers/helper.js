export default {
    filtermessage: (m, data) => {
        let result;
        if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
        } else if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;
        } else if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption;
        } else if (m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.caption) {
            result = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.caption;
        } else {
            result = data;
        }

        return result;
    }
};
