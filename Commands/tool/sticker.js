import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import Function from '../../Classes/Function.js';

import fs from 'fs';

export default {
    name: 'sticker',
    prefix: ["sticker"],
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let image;
            try {

                if (ctx.messageType === 'extendedTextMessage' || ctx.messageType == 'imageMessage' || ctx.messageType == 'videoMessage') {
                    image = await Function.getMediaBuffer(ctx)
                    console.log(image)
                }  else {
                    await ctx.reply([{ text: 'Please reply to an image or send an image.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                    await ctx.react('⛔');
                    return;
                }
            } catch (err) {
                console.log(err)
                await ctx.reply([{ text: 'Media not found or could not be processed.' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('⛔');
                return; 
            }

            const tempFilePath = './tmp-s.jpeg';
            fs.writeFileSync(tempFilePath, image);

            const sticker = new Sticker(tempFilePath, {
                pack: 'My Pack', // The pack name
                author: 'Yrizzz', // The author name
                type: StickerTypes.FULL, // Use StickerTypes enum for clarity
                categories: ['🎉'], // The sticker category
                id: ctx.id, // The sticker id
                quality: 50, // The quality of the output file
                background: '#000000' // The sticker background color (only for full stickers)
            });

            const msg = await sticker.toMessage();
            await ctx.reply([msg, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            await ctx.react('✅');

            fs.unlink(tempFilePath, (err) => {
                if (err) {
                    console.error('Error deleting temporary file:', err); 
                } else {
                    console.log('Temporary sticker file deleted.');
                }
            });

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply([{ text: 'Failed to fetch please contact the owner' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
        }
    }
};