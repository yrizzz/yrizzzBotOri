// who.js (ES6 Module)
import req from '../../handler/req.js';

export default {
    name: 'who',
    type: 'command',
    code: async (ctx) => {
        const m = ctx._msg;
        const command = m.content.split(' ')[0];
        const data = m.content.slice(command.length + 1);
        await ctx.react(ctx.id, '⏳');

        try {
            console.log(m.message);

            let s = m?.message?.extendedTextMessage?.contextInfo?.participant || data || '';

            if (typeof s === 'string' && s.length > 2) {
                s = '0' + s.slice(2);
                s = s.replace('@s.whatsapp.net', '');
            } else {
                s = '';
            }

            const sender = data ? data : s;
            const result = await req('GET', `https://yrizzz.my.id/api/v1/tool/phoneChecker?phone=${sender}`);
            const formatted = JSON.stringify(result.data, null, 2);

            await ctx.reply(
                { text: formatted },
                { ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }
            );
            await ctx.react(ctx.id, '✅');
        } catch (err) {
            console.error(err);
            await ctx.react(ctx.id, '⛔');
            await ctx.reply(
                { text: 'internal server error' },
                { ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }
            );
        }
    }
};
