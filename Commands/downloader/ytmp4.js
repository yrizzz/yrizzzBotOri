import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'ytvideo',
    aliases: ['ytvid', 'ytvideo', 'ytmp4'],
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);


            await ctx.react('🔄');
            const result = await req('GET', `https://yrizzz.my.id/api/v1/downloader/youtube?data=${helper.link(data)}&format=720`);
            if (result.status) {
                await ctx.reply([{ video: { url: result.data.download_url }, caption: '✅ Success\n\ntitle : ' + result.data.title }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('✅');
            }

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply([{ text: 'Failed to fetch please contact the owner' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
        }
    }
};
