// File: commands/menu.js
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
export default {
    name: 'menu',
    type: 'command',
    code: async (ctx) => {
        try {
            const commandsRootDir = path.resolve('./Commands'); // Root directory for all commands

            // Use an object to store commands, grouped by subfolder
            const groupedCommands = {}; // e.g., { 'general': ['help', 'ping'], 'socialmedia': ['igprofile', 'ttprofile'] }

            // Read the contents of the commands root directory
            const topLevelItems = await fs.readdir(commandsRootDir, { withFileTypes: true });

            for (const item of topLevelItems) {
                const itemPath = path.join(commandsRootDir, item.name);

                if (item.isDirectory()) {
                    // It's a subfolder, read its contents
                    const subfolderName = item.name;
                    groupedCommands[subfolderName] = []; // Initialize array for this group

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
                    // Sort commands within each group alphabetically
                    groupedCommands[subfolderName].sort();
                } else if (item.isFile() && item.name.endsWith('.js')) {
                    // It's a direct command file in the root 'commands' folder
                    // You might want to put these in a "General" or "Ungrouped" category
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

            // Iterate through groupedCommands object to build the menu text
            for (const groupName in groupedCommands) {
                if (groupedCommands[groupName].length > 0) {
                    hasCommands = true;
                    // Capitalize the first letter of the group name for display
                    const displayGroupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
                    menuText += `*「 ${displayGroupName} 」*\n`;
                    groupedCommands[groupName].forEach(commandName => {
                        menuText += `- .${commandName}\n`;
                    });
                    menuText += '\n'; // Add a newline after each group
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