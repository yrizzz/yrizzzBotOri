import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'domaininfo',
    type: 'command',
    code: async (ctx) => {
        try {
            ctx.react('⏳');
            const regex = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.?[a-zA-Z0-9_\-]{1,})(\.[a-zA-Z0-9]{2,})/g;

            let data = helper.filtermessage(ctx.msg, ...ctx.args);

            let link = data.match(regex)?.[0];

            if (!link) {
                ctx.react('⛔');
                ctx.reply('Please provide a valid domain name');
                return;
            }

            link = link.replace(/https?:\/\/(www\.)?/g, '');

            const result = await req('GET', `https://yrizzz.my.id/api/v1/domain/domaininfo?domain=${link}`);

            if (result.status) {
                let rplyMessage = `🌐 Domain Info: ${link}\n\n`;
                for (const [key, value] of Object.entries(result.data)) {
                    rplyMessage += `${key} : ${value}\n`;
                }

                ctx.reply(rplyMessage);
                ctx.react('✅');
            } else {
                ctx.react('⛔');
                ctx.reply('Failed to retrieve domain information');
            }

        } catch (err) {
            ctx.react('⛔');
            ctx.reply('Failed to fetch please contact the owner');
        }
    }
};