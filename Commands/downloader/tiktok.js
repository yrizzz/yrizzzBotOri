import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
	name: 'tt',
	type: 'command',
	code: async (ctx) => {
		try {
			ctx.react('⏳');
			let data = helper.filtermessage(ctx.msg, ...ctx.args);

			const result = await req('GET', `https://yrizzz.my.id/api/v1/downloader/tiktok?data=${data}`);

			if (result.status) {

				ctx.reply({ video: { url: result.data.withOutWtrmk }, caption: '✅ Success' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 });
				ctx.react('✅');
			}

		} catch (err) {
			ctx.react('⛔');
			ctx.reply({ text: 'internal server error' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 });
		}
	}
};
