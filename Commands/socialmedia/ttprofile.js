import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'ttprofile',
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);


            const result = await req('GET', `https://yrizzz.my.id/api/v1/socialmedia/ttprofile?username=${data}`);

            if (result.status) {
                let caption = '✅ Success\n\n';
                caption += 'Nickname : ' + result.data.userInfo.user.nickname + '\n';
                caption += 'Username : ' + data + '\n';
                caption += 'Follower : ' + result.data.userInfo.stats.followerCount + '\n';
                caption += 'Following : ' + result.data.userInfo.stats.followingCount + '\n';
                caption += 'Total video : ' + result.data.userInfo.stats.videoCount;

                await ctx.reply([{ image: { url: result.data.userInfo.user.avatarLarger }, caption: caption }, { ephemeralExpiration: ctx?.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
                await ctx.react('✅');
            }
            return;
        } catch (err) {
            console.log(err)
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');

        }
    }
};