import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'dnsrecord',
    type: 'command',
    code: async (ctx) => {

        try {
            await ctx.react('⏳');
            const regex = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.?[a-zA-Z0-9\_\-]{1,})(\.[a-zA-Z0-9]{2,})/g;

            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);
            let link = helper.link(data);

            const result = await req('GET', `https://yrizzz.my.id/api/v1/domain/dnsrecord?domain=${link}`);

            if (result.status) {
                let rplyMessage = `🌐 DNS Record : ${link}\n\n${JSON.stringify(result.data, null, 2)}`;
                await ctx.reply(rplyMessage);
                await ctx.react('✅');
            } else {
                await ctx.react('⛔');
                await ctx.reply('Failed to retrieve DNS record');
            }

        } catch (err) {
            await ctx.react(await ctx.id, '⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};