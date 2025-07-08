// sticker.js (ES6 Module)
import { MessageType } from '@mengkodingan/ckptw';
import { Sticker } from 'wa-sticker-formatter';

export default {
    name: 'sticker',
    aliases: ['sticker', 's'],
    command: 'command',
    code: async (ctx) => {
        const m = ctx._msg;
        const command = m.content.split(' ')[0];
        await ctx.react(ctx.id, '⏳');

        try {
            let imageBuffer;

            try {
                const type = ctx.getMessageType();
                if (type === MessageType.extendedTextMessage) {
                    imageBuffer = await ctx.quoted.media.toBuffer();
                } else if (type === MessageType.imageMessage) {
                    imageBuffer = await ctx.msg.media.toBuffer();
                } else {
                    return false;
                }
            } catch (err) {
                await ctx.reply({ text: 'media not found' }, {
                    ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0
                });
                await ctx.react(ctx.id, '⛔');
                return;
            }

            const sticker = new Sticker(imageBuffer, {
                pack: 'My Pack',
                author: 'Yrizzz',
                type: 'full',
                categories: ['🎉'],
                id: ctx.id,
                quality: 50,
                background: '#000000'
            });

            const msg = await sticker.toMessage();
            console.log(msg);
            await ctx.reply(msg, {
                ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0
            });
            await ctx.react(ctx.id, '✅');
        } catch (err) {
            console.error(err);
            await ctx.react(ctx.id, '⛔');
            await ctx.reply({ text: 'internal server error' }, {
                ephemeralExpiration: m?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0
            });
        }
    }
};
