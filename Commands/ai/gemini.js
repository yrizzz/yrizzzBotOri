// gemini.js (ES6 Module)
import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'gemini',
    prefix: ['gemini', 'gm'],
    type: 'command',
    code: async (ctx) => {
        try {
            ctx.react('⏳');
            let data = helper.filtermessage(ctx.msg, ...ctx.args);
            const result = await req('GET', `https://yrizzz.my.id/api/v1/ai/geminiAi?prompt=${encodeURIComponent(data)}`);
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
