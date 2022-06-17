import Discord from "discord.js";

export default class CommandsHandler {
    public interaction: Discord.CommandInteraction

    constructor(interaction: Discord.CommandInteraction) {
        this.interaction = interaction;
    }

    public async handle() {
        let command = global.client.cache.commands.get(this.interaction.commandName);
        if(!command) return;
        await this.interaction.deferReply();
        let result = await command.execute(this.interaction);
        await this.interaction.editReply(result.reply);
        if(result.interaction) global.client.cache.interactions.set(result.interaction.id, result.interaction);
    }
}