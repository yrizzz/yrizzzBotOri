export default {
    name: 'mention',
    type: 'command',
    code: async (ctx) => {
        const msg = ctx.msg;
        const jid = msg?.key?.remoteJid;
        const isGroup = jid?.endsWith('g.us');
        if (!isGroup) return;
        const meta = await ctx.sock.groupMetadata(jid);
        if (!meta) return;
        const participantId = msg.key.participant;
        const participant = meta.participants?.find(p => p.id === participantId);
        if (!participant || !participant.admin) return;
        const ids = meta.participants.map(p => p.id);
        const expiration = msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0;
        await ctx.reply([
            {
                text: ctx.content.slice(9),
                mentions: ids
            },
            {
                quoted: ctx.msg,
                ephemeralExpiration: expiration
            }
        ]);
    }

};