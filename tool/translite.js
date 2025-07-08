// translite.js (ES6 Module)
import req from '../../handler/req.js';
import helper from '../../handler/helper.js';
import FormData from 'form-data';

export default {
    name: 'translite',
    aliases: ['tr', 'translite'],
    type: 'command',
    code: async (ctx) => {
        const m = ctx._msg;
        const command = m.content.split(' ')[0];
        let data = m.content.slice(command.length + 3); // assumes "tr id [text]" format

        await ctx.react(ctx.id, '⏳');

        try {
            data = helper.filtermessage(m, data);
            const to = m.content.split(' ')[1] || 'id';

            const result = await req(
                'GET',
                `https://yrizzz.my.id/api/v1/tool/translate?from=auto&to=${to}&data=${encodeURIComponent(data)}`
            );

            let replyMsg = '';
            replyMsg += '✅ Translated successfully\n';
            replyMsg += `» Detected : *${result.data.detect}*\n`;
            replyMsg += `» To : *${to}*\n\n`;
            replyMsg += '`Result :`\n';
            replyMsg += result.data.translated;

            await ctx.reply(
                { text: replyMsg },
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
