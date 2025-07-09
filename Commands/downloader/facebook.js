import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
	name: 'fb',
	type: 'command',
	code: async (ctx) => {
		try {
			await ctx.react('⏳');
			let data = helper.filtermessage(await ctx.msg, ...await ctx.args);
			const result = await req('GET', `https://yrizzz.my.id/api/v1/downloader/facebook?data=${helper.link(data)}`);

			if (result.status) {
				let url = await result.data.video.hd.url ?? result.data.video.sd.url;
				await ctx.reply([{ video: { url: url }, caption: `✅ Success\n\nCaption : ${result?.data?.caption}` }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
				await ctx.react('✅');
			}


		} catch (err) {
			await ctx.react('⛔');
			await ctx.reply([{ text: 'Failed to fetch please contact the owner' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
		}
	}
};
