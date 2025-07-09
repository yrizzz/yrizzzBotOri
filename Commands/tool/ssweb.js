import req from '../../Handlers/req.js';
import helper from '../../Handlers/helper.js';

export default {
    name: 'ssweb',
    prefix: ["ssweb","ss"],
    type: 'command',
    code: async (ctx) => {
        try {
            await ctx.react('⏳');
    
            let data = helper.filtermessage(await ctx.msg, ...await ctx.args); 
            let link = helper.link(data);
            const type = ctx.content.match(/fullpage|mobile|desktop/) ? ctx.args[1] : 'desktop';
            const result = await req('GET', `https://yrizzz.my.id/api/v1/tool/ssweb?domain=${link}&type=${type}`);
            const buffer = Buffer.from(result.data, 'base64');
            await ctx.reply([{ 
                image: buffer, 
                caption: 'Success ✅\n\nsupport : fullpage|mobile|desktop' 
            }, { 
                ephemeralExpiration: ctx.msg?.message?.extendedTextMessage?.contextInfo?.expiration ?? 0 
            }]);
            await ctx.react('✅');
    
        } catch (err) {
            await ctx.react('⛔');
            await ctx.reply('Failed to fetch the screenshot. Please ensure you provided a valid URL and try again.');
        }
    }
};