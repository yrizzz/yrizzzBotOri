import { MessageType } from "@mengkodingan/ckptw";
import req from '../../handler/req.js';
import sharp from 'sharp';
import FormData from 'form-data';
import { Blob } from 'buffer';

export default {
    name: 'bg',
    type: 'command',
    code: async (ctx) => {
        let m = ctx._msg;
        let command = m.content.split(' ')[0];
        let data = m.content.slice(command.length + 1);
        await ctx.react(ctx.id, '⏳')
        try {
            let buffer;
            try {
                if (ctx.getMessageType() === MessageType.extendedTextMessage) {
                    buffer = await ctx.quoted.media.toBuffer();
                } else if (ctx.getMessageType() === MessageType.imageMessage) {
                    buffer = await ctx.msg.media.toBuffer();
                } else {
                    return false;
                }
            } catch (err) {
                await ctx.reply({ text: 'image not found' }, { ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 });
                await ctx.react(ctx.id, '⛔')
            } 

            let formdata = new FormData();
            formdata.append('image', buffer, { filename: 'image.jpg' }); //this image from wa as buffer

            const result = await req('POST', `https://yrizzz.my.id/api/v1/tool/removeBg`, formdata)

            buffer = Buffer.from(result.data, 'base64');
            await sharp.cache(false);
            const res = await sharp(buffer)
                .flatten({ background: data })
                .jpeg({ progressive: true })
                .toBuffer();
            await ctx.reply({ image: res, caption: 'Success ✅' }, { ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 });
            await ctx.react(ctx.id, '✅')


        } catch (err) {
            console.log(err)
            await ctx.react(ctx.id, '⛔')
            await ctx.reply({ text: 'internal server error' }, { ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 });
        }
    }
}
