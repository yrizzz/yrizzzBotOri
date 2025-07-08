import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'dnsrecord',
    type: 'command',
    code: async (ctx) => {

        try {
            ctx.react('⏳');
            const regex = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.?[a-zA-Z0-9\_\-]{1,})(\.[a-zA-Z0-9]{2,})/g;

            let data = helper.filtermessage(ctx.msg, ...ctx.args);

            let link = data.match(regex)?.[0];

            if (!link) {
                ctx.react('⛔');
                ctx.reply('Invalid domain format provided');
                return; // Exit if no link found
            }

            link = link.replace(/https?:\/\/(www\.)?/g, ''); // More robust regex for replacements

            const result = await req('GET', `https://yrizzz.my.id/api/v1/domain/dnsrecord?domain=${link}`);

            if (result.status) {
                let rplyMessage = `🌐 DNS Record : ${link}\n\n${JSON.stringify(result.data, null, 2)}`;
                ctx.reply(rplyMessage);
                ctx.react('✅');
            } else {
                ctx.react('⛔');
                ctx.reply('Failed to retrieve DNS record');
            }

        } catch (err) {
            ctx.react(ctx.id, '⛔');
            ctx.reply('Failed to fetch please contact the owner');
        }
    }
};