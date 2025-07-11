import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
	name: 'instagramDownloader',
	aliases:['ig'],
	type: 'command',
	code: async (ctx) => {
		try {
			await ctx.react('⏳');
			let data = helper.filtermessage(await ctx.msg, ...await ctx.args);
			console.log(helper.link(data))

			const result = await req('GET', `https://yrizzz.my.id/api/v1/downloader/instagram?data=${helper.link(data)}`);
			console.log(result);

			if (result.status) {
				if (result.data?.mediaUrls[0]?.url) {
					const link = result.data?.mediaUrls[0].url
					const type = result.data?.type
					const username = result.data?.username
					const caption = result.data?.caption

					await ctx.reply([{ video: { url: link }, caption: `✅ Success\n\nType : ${type}\nUsername : ${username}\nCaption : ${caption}` }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
					await ctx.react('✅');
				}
			}

		} catch (err) {
			console.log(err)
			await ctx.react('⛔');
			await ctx.reply([{ text: 'Failed to fetch please contact the owner' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
		}
	}
};
