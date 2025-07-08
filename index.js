import { YrizzBot } from './Classes/Main.js'
const bot = new YrizzBot()
await bot.start()
await bot.loadCommands()

// await bot.hears('ping', (ctx) => {
//     ctx.reply('pong');
// })

// await bot.command('bang', (ctx) => {
//     ctx.reply('halo cuy');
// })