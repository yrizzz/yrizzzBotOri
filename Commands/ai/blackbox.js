// blackbox.js (ES6 Module)
import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'blackbox',
    prefix: ['blackbox', 'bb'],
    type: 'command',
    code: async (ctx) => {
        try {
            ctx.react('⏳');
            let data = helper.filtermessage(ctx.msg, ...ctx.args);
            const result = await req('GET', `https://yrizzz.my.id/api/v1/ai/blackboxAi?prompt=${encodeURIComponent(data)}`);
            if (result.status) {
                ctx.reply(result.data);
                ctx.react('✅');
            }
        } catch (err) {
            ctx.react('⛔');
            ctx.reply('Failed to fetch please contact the owner');
        }
    }
};
