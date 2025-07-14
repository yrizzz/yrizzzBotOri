import req from '../../Handlers/req.js';
import Function from '../../Classes/Function.js';

export default {
    name: 'who',
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let s = Function.jid(ctx.msg);
            if (typeof s === 'string' && s.length > 2) {
                s = '0' + s.substring(2);
                s = s.replace('@s.whatsapp.net', '');
            } else {
                s = '';
            }
            let sender = ctx.args.length > 0 ? ctx.args.join() : s;
            let result = await req('GET', `https://yrizzz.my.id/api/v1/tool/phoneChecker?phone=${sender}`);
            result = JSON.stringify(result.data, null, 2);
            await ctx.reply([{ text: '✅ Success\n\n' + result }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            await ctx.react('✅');

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};