import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'translite',
    prefix: ["tr", "translate"],
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let to = ctx.args[0] || 'id';
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);

            const result = await req('GET', `https://yrizzz.my.id/api/v1/tool/translate?from=auto&to=${to}&data=${data}`);

            let replyMsg = '';
            replyMsg += '✅ Translated successfully\n';
            replyMsg += `» Detected : *${result.data.detect}*\n`;
            replyMsg += `» To : *${to}*\n\n`;
            replyMsg += '`Result :`\n';
            replyMsg += result.data.translated;

            await ctx.reply([{ text: replyMsg }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            await ctx.react('✅');

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');

        }
    }
};