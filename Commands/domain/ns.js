import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'ns',
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

            const result = await req('GET', `https://yrizzz.my.id/api/v1/domain/nameserver?domain=${link}`);

            if (result.status) {
                let rplyMessage = `🌐 Nameserver : ${link}\n\n`;
                if (Array.isArray(result.data) && result.data.length > 0) {
                    rplyMessage += result.data.map((item) => item).join('\n');
                } else {
                    rplyMessage += 'No nameservers found or data format is unexpected.';
                }

                ctx.reply(rplyMessage);
                ctx.react('✅');
            } else {
                ctx.react('⛔');
                ctx.reply('Failed to retrieve nameserver information');
            }

        } catch (err) {
            ctx.react('⛔');
            ctx.reply('Failed to fetch please contact the owner');

        }
    }
};