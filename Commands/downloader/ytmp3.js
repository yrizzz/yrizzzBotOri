import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'ytaudio',
    prefix: ['ytaudio', 'ytmp3'],
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);


            await ctx.react('🔄');

            const result = await req('GET', `https://yrizzz.my.id/api/v1/downloader/youtube?data=${helper.link(data)}&format=mp3`);
            if (result.status) {
                await ctx.reply([{ audio: { url: result.data.download_url }, caption: '✅ Success\n\ntitle : ' + result.data.title, mimetype: 'audio/mp4' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('✅');
            }

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply([{ text: 'Failed to fetch please contact the owner' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
        }
    }
};
