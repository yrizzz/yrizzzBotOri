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

        let participantId = msg.key.participant;

        // ✅ Handle LID participant format
        if (participantId?.endsWith('lid')) {
            const lid = meta.participants?.find(p => p?.id === participantId);
            if (lid?.jid) {
                participantId = lid.jid;
            }
        }

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
                quoted: msg,
                ephemeralExpiration: expiration
            }
        ]);
    }
};
