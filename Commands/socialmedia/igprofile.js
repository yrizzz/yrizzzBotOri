import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'igprofile',
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);

            const result = await req('GET', `https://yrizzz.my.id/api/v1/socialmedia/igprofile?username=${data}`);

            if (result.status) {
                let caption = '✅ Success\n\n';
                caption += 'Fullname : ' + result.data.full_name + '\n';
                caption += 'Username : ' + result.data.username + '\n';
                caption += 'Biography : ' + result.data.biography + '\n';
                caption += 'Follower : ' + result.data.follower_count + '\n';
                caption += 'Following : ' + result.data.following_count + '\n';
                caption += 'Total post : ' + result.data.media_count;

                await ctx.reply([{ image: { url: result.data.hd_profile_pic_url_info.url }, caption: caption }, { ephemeralExpiration: ctx?.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('✅');
            }
            return;

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');

        }
    }
};