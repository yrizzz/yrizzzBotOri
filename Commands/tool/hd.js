import req from '../../Handlers/req.js';
import Function from '../../Classes/Function.js';
import FormData from 'form-data';
export default  {
    name: 'hd',
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let buffer;
            try {
                if (ctx.messageType === 'extendedTextMessage' || ctx.messageType == 'imageMessage') {
                    buffer = await Function.getMediaBuffer(ctx)
                } else {
                    return false;
                }
            } catch (err) {
                await ctx.reply([{ text: 'image not found' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('⛔');
            }

            let formdata = new FormData();
            formdata.append('image', buffer, { filename: 'image.jpg' });

            const result = await req('POST', `https://yrizzz.my.id/api/v1/tool/imageHd`, formdata);
            buffer = Buffer.from(result.data, 'base64');

            await ctx.reply([{ image: buffer, caption: 'Success ✅' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            await ctx.react('✅');

        } catch (err) {
            console.log(err);
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};