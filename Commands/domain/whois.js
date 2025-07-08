import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'whois',
    type: 'command',
    code: async (ctx) => {

        try {
            ctx.react('⏳');
            const regex = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.?[a-zA-Z0-9_\-]{1,})(\.[a-zA-Z0-9]{2,})/g;
            let data = helper.filtermessage(ctx.msg, ...ctx.args);

            let link = data.match(regex)?.[0];

            if (!link) {
                ctx.react('⛔');
                ctx.reply('Please provide a valid domain name (e.g., example.com)');
                return;
            }

            link = link.replace(/https?:\/\/(www\.)?/g, '');

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

                ctx.reply(rplyMessage);
                ctx.react('✅');
            } else {
                ctx.react('⛔');
                ctx.reply('Failed to retrieve Whois information');
            }

        } catch (err) {
            ctx.react('⛔');
            ctx.reply('Failed to fetch please contact the owner');
        }
    }
};