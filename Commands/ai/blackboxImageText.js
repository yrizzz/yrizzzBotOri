import req from '../../Handlers/req.js';
import Function from '../../Classes/Function.js';
export default {
    name: 'bang',
    type: 'command',
    code: async (ctx) => {

        try {
            await ctx.react('⏳');
            let data = await ctx.args.join(' ');
            let buffer = await Function.getMediaBuffer(ctx)

            const formdata = new FormData();
            formdata.append('image', new Blob([buffer]), 'image.jpg');
            formdata.append('prompt', data);

            const result = await req('POST', 'https://yrizzz.my.id/api/v1/ai/blackboxImageText', formdata);

            await ctx.reply(result.data.replaceAll('**', '*'))
            await ctx.react('✅');

            return;
        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};
