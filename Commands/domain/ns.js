import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'ns',
    type: 'command',
    code: async (ctx) => {

        try {
            await ctx.react('⏳');
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);


            const result = await req('GET', `https://yrizzz.my.id/api/v1/domain/nameserver?domain=${helper.link(data)}`);

            if (result.status) {
                let rplyMessage = `🌐 Nameserver : ${helper.link(data)}\n\n`;
                if (Array.isArray(result.data) && result.data.length > 0) {
                    rplyMessage += result.data.map((item) => item).join('\n');
                } else {
                    rplyMessage += 'No nameservers found or data format is unexpected.';
                }

                await ctx.reply(rplyMessage);
                await ctx.react('✅');
            } else {
                await ctx.react('⛔');
                await ctx.reply('Failed to retrieve nameserver information');
            }

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');

        }
    }
};