import req from '../../Handlers/req.js';
import Function from '../../Classes/Function.js';
import FormData from 'form-data';

export default {
    name: 'rmbg',
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let buffer;
            try {
                if (ctx.messageType === 'extendedTextMessage' || ctx.messageType == 'imageMessage') {
                    buffer = await Function.getMediaBuffer(ctx)
                } else {
                    await ctx.reply([{ text: 'Please reply to an image or send an image to remove its background.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                    await ctx.react('⛔');
                    return; 
                }
            } catch (err) {
                console.error("Error getting media:", err); 
                await ctx.reply([{ text: 'Media not found or could not be processed.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('⛔');
                return; 
            }

            const formdata = new FormData();
            formdata.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' }); 

            const result = await req('POST', `https://yrizzz.my.id/api/v1/tool/removeBg`, formdata);
            if (!result.data) {
                await ctx.reply([{ text: 'No data received from background removal service.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('⛔');
                return;
            }

            const outputBuffer = Buffer.from(result.data, 'base64'); // Renamed for clarity

            await ctx.reply([{ image: outputBuffer, caption: 'Success ✅' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            await ctx.react('✅');

        } catch (err) {
            console.error('An unexpected error occurred:', err); // Catch all other errors
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};