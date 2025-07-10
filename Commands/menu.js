import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
export default {
    name: 'menu',
    type: 'command',
    code: async (ctx) => {
        try {
            const commandsRootDir = path.resolve('./Commands'); 

            const groupedCommands = {}; 

            const topLevelItems = await fs.readdir(commandsRootDir, { withFileTypes: true });

            for (const item of topLevelItems) {
                const itemPath = path.join(commandsRootDir, item.name);

                if (item.isDirectory()) {
                    const subfolderName = item.name;
                    groupedCommands[subfolderName] = []; 

                    const commandFiles = await fs.readdir(itemPath);

                    for (const file of commandFiles) {
                        if (file.endsWith('.js')) {
                            const commandFilePath = path.join(itemPath, file);
                            const fileUrl = pathToFileURL(commandFilePath).href;

                            try {
                                const { default: commandModule } = await import(fileUrl);
                                if (commandModule && commandModule.name) {
                                    groupedCommands[subfolderName].push(commandModule.name);
                                }
                            } catch (importError) {
                                console.warn(`[Menu Command] Could not import command file ${file} in ${subfolderName}:`, importError.message);
                            }
                        }
                    }
                    groupedCommands[subfolderName].sort();
                } else if (item.isFile() && item.name.endsWith('.js')) {
                    if (!groupedCommands['general']) {
                        groupedCommands['general'] = [];
                    }
                    const commandFilePath = path.join(commandsRootDir, item.name);
                    const fileUrl = pathToFileURL(commandFilePath).href;
                    try {
                        const { default: commandModule } = await import(fileUrl);
                        if (commandModule && commandModule.name && commandModule.name !== 'menu') { // Exclude menu itself if it's in the root
                            groupedCommands['general'].push(commandModule.name);
                        }
                    } catch (importError) {
                        console.warn(`[Menu Command] Could not import command file ${item.name} in root:`, importError.message);
                    }
                }
            }

            let menuText = "📚 *Available Commands:* 📚\n\n";
            let hasCommands = false;

            for (const groupName in groupedCommands) {
                if (groupedCommands[groupName].length > 0) {
                    hasCommands = true;
                    const displayGroupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
                    menuText += `*「 ${displayGroupName} 」*\n`;
                    groupedCommands[groupName].forEach(commandName => {
                        menuText += `- .${commandName}\n`;
                    });
                    menuText += '\n'; 
                }
            }

            menuText += `\n_Support prefix ${JSON.stringify(ctx.prefixSupport)}_`;

            if (!hasCommands) {
                menuText += "No commands found. Make sure your command files are in the 'commands' folder (or its subfolders) and export a 'name' property.";
            } else {
                menuText += "\n_*By Yrizzz*_";
            }

            await ctx.reply(menuText);
            await ctx.react('📖');
        } catch (error) {
            console.error("[Menu Command] Error generating menu:", error);
            await ctx.react('❌');
        }
    }
};