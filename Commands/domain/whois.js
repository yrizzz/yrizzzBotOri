import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'whois',
    type: 'command',
    code: async (ctx) => {

        try {
            await ctx.react('⏳');
            const regex = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.?[a-zA-Z0-9_\-]{1,})(\.[a-zA-Z0-9]{2,})/g;
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args);

            let link = helper.link(data);

            const result = await req('GET', `https://yrizzz.my.id/api/v1/domain/whois?domain=${link}`);

            if (result.status) {
                let rplyMessage = `🌐 Whois : ${link}\n`;

                if (typeof result.data === 'object' && result.data !== null && Object.keys(result.data).length > 0) {
                    for (const [category, details] of Object.entries(result.data)) {
                        rplyMessage += '\n';
                        rplyMessage += `🔰 ${category}\n`;

                        if (typeof details === 'object' && details !== null) {
                            for (const [detailKey, detailValue] of Object.entries(details)) {
                                if (detailKey !== 'text') {
                                    rplyMessage += `${detailKey} : ${detailValue}\n`;
                                }
                            }
                        }
                    }
                } else {
                    rplyMessage += 'No Whois information found or data format is unexpected.';
                }

                await ctx.reply(rplyMessage);
                await ctx.react('✅');
            } else {
                await ctx.react('⛔');
                await ctx.reply('Failed to retrieve Whois information');
            }

        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch please contact the owner');
        }
    }
};