import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
	name: 'fb',
	type: 'command',
	code: async (ctx) => {
		ctx.react('⏳');
		try {
			let data = helper.filtermessage(ctx.msg, ...ctx.args);
			const result = await req('GET', `https://yrizzz.my.id/api/v1/downloader/facebook?data=${data}`);

			if (result.status) {
				ctx.reply({ video: { url: result.data.video.hd }, caption: '✅ Success' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 });
				ctx.react('✅');
			}

		} catch (err) {
			ctx.react('⛔');
			ctx.reply({ text: 'internal server error' }, { ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 });
		}
	}
};
