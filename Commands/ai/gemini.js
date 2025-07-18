// gemini.js (ES6 Module)
import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'gemini',
    aliases: ['gemini', 'gm'],
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);
            const result = await req('GET', `https://yrizzz.my.id/api/v1/ai/geminiAi?prompt=${encodeURIComponent(data)}`);
            if (result.status) {
                await ctx.reply(result.data);
                await ctx.react(await ctx.id, '✅');
            }
        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};
