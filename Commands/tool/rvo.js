import Function from '../../Classes/Function.js';

export default {
    name: 'readviewonce',
    aliases: ['readviewonce', 'rvo'],
    type: 'command',
    code: async (ctx) => {
        try {
            const media = await Function.getMediaBuffer(ctx)
            const message = ctx.msg.message.extendedTextMessage.contextInfo.quotedMessage;
            const type = Object.keys(message);
            if (type == 'videoMessage') {
                await ctx.reply([{ video: media, caption: 'Success ✅' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            } else {
                await ctx.reply([{ image: media, caption: 'Success ✅' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
            }
        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};