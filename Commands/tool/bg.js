import req from '../../Handlers/req.js';
import Function from '../../Classes/Function.js';
import FormData from 'form-data';
import sharp from 'sharp';

export default {
    name: 'bg',
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let buffer;
            let data = ctx.args[0]
            try {
                if (ctx.messageType === 'extendedTextMessage' || ctx.messageType == 'imageMessage') {
                    buffer = await Function.getMediaBuffer(ctx)
                } else {
                    await ctx.reply([{ text: 'Please reply to an image or send an image.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                    await ctx.react('⛔');
                    return;
                }
            } catch (err) {
                await ctx.reply([{ text: 'Image not found or could not be processed.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('⛔');
                return;
            }

            const formdata = new FormData();
            formdata.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' }); // Added contentType for robustness

            const result = await req('POST', `https://yrizzz.my.id/api/v1/tool/removeBg`, formdata);

            if (!result.data) {
                await ctx.reply([{ text: 'No image data received from background removal service.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('⛔');
                return;
            }

            let imageWithRemovedBgBuffer = Buffer.from(result.data, 'base64');

            await sharp.cache(false); 

            let backgroundColor = data || 'white'; 

            const finalImageBuffer = await sharp(imageWithRemovedBgBuffer)
                .flatten({ background: backgroundColor }) 
                .jpeg({ progressive: true })
                .toBuffer();

            await ctx.reply([{ image: finalImageBuffer, caption: 'Success ✅' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            await ctx.react('✅');

        } catch (err) {
            console.log(err)
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');

        }
    }
};