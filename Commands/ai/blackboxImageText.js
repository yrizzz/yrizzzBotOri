import req from '../../Handlers/req.js';
import Function from '../../Classes/Function.js';
export default {
    name: 'bang',
    type: 'command',
    code: async (ctx) => {

        try {
            ctx.react('⏳');
            let data = ctx.args.join(' ');
            let buffer = await Function.getMediaBuffer(ctx)

            const formdata = new FormData();
            formdata.append('image', new Blob([buffer]), 'image.jpg');
            formdata.append('prompt', data);

            const result = await req('POST', 'https://yrizzz.my.id/api/v1/ai/blackboxImageText', formdata);

            if (result.status) {
                ctx.reply(result.data.replaceAll('**', '*'))
                ctx.react('✅');
            }

        } catch (err) {
            ctx.react('⛔');
            ctx.reply('Failed to fetch please contact the owner');
        }
    }
};
