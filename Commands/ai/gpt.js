// gpt.js (ES6 Module)
import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'gpt',
    type: 'command',
    code: async (ctx) => {
        await ctx.react('⏳');
        try {
            let data = helper.filtermessage(ctx.msg, ...ctx.args);

            const result = await req('GET', `https://yrizzz.my.id/api/v1/ai/chatGpt?prompt=${encodeURIComponent(data)}`);

            if (result.status) {
                ctx.reply(result.data);
                ctx.react(ctx.id, '✅');
            }

        } catch (err) {
            ctx.react('⛔');
            ctx.reply('Failed to fetch please contact the owner');
        }
    }
};
