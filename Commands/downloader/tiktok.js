import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
	name: 'tiktok',
	prefix: ['tiktok'],
	type: 'command',
	code: async (ctx) => {
		try {
			await ctx.react('⏳');
			let data = helper.filtermessage(await ctx.msg, ...await ctx.args);


			const result = await req('GET', `https://yrizzz.my.id/api/v1/downloader/tiktok?data=${helper.link(data)}`);

			if (result.status) {
				await ctx.reply([{ audio: { url: result.data.withOutWtrmk }, caption: '✅ Success', mimetype: 'audio/mp4' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
				await ctx.reply([{ video: { url: result.data.withOutWtrmk }, caption: '✅ Success' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
				await ctx.react('✅');
			}

		} catch (err) {
			await ctx.react('⛔');
			await ctx.reply([{ text: 'Failed to fetch please contact the owner' }, { ephemeralExpiration: await ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 }]);
		}
	}
};
