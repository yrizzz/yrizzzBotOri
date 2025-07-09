import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'domaininfo',
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);

            let link = helper.link(data);

            const result = await req('GET', `https://yrizzz.my.id/api/v1/domain/domaininfo?domain=${link}`);

            if (result.status) {
                let rplyMessage = `🌐 Domain Info: ${link}\n\n`;
                for (const [key, value] of Object.entries(result.data)) {
                    rplyMessage += `${key} : ${value}\n`;
                }

                await ctx.reply(rplyMessage);
                await ctx.react('✅');
            } else {
                await ctx.react('⛔');
                await ctx.reply('Failed to retrieve domain information');
            }

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};