import Discord from "discord.js";
import CommandError from "@/utils/CommandError";
import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";

export default class InteractionsHandler {
    public interaction: Discord.Interaction

    constructor(interaction: Discord.Interaction) {
        this.interaction = interaction;
    }

    public async handle() {
        if(!this.interaction.isButton() && !this.interaction.isSelectMenu()) return
        let idSplit = this.interaction.customId.split("-")
        let inter = global.client.cache.interactions.get(idSplit[0]);
        let permInter = global.client.cache.permanentInteractions.get(this.interaction.message.id);
        if(permInter) return this.handlePermanent(permInter)
        if(!inter) {
            return this.interaction.reply({
                embeds:
                    [CommandError.other(this.interaction.member as Discord.GuildMember,
                        "Данное взаимодействие больше недоступно", "Взаимодействие недоступно")],
                ephemeral: true
            })
        }
        if(inter.processing) {
            return this.interaction.reply({
                embeds:
                    [CommandError.other(this.interaction.member as Discord.GuildMember,
                        "Данное взаимодействие уже выполняется, повторите попытку позже",
                        "Взаимодействие недоступно")],
                ephemeral: true
            })
        }
        if(inter.allowedUsers && !inter.allowedUsers?.includes(this.interaction.user.id)) {
            return this.interaction.reply({
                embeds:
                    [CommandError.other(this.interaction.member as Discord.GuildMember,
                        "Вам недоступно это взаимодействие", "Взаимодействие недоступно")],
                ephemeral: true
            })
        }
        inter.processing = true;
        global.client.cache.interactions.set(inter.id, inter);
        await this.interaction.deferUpdate();
        let result = await inter.execute(this.interaction, idSplit[1]);
        inter.processing = false;
        if(result.ended) global.client.cache.interactions.delete(inter.id);
        else global.client.cache.interactions.set(inter.id, inter);
        if(result.interaction) global.client.cache.interactions.set(result.interaction.id, result.interaction);
    }

    private async handlePermanent(inter: AbstractPermanentInteraction) {
        if(!this.interaction.isButton() && !this.interaction.isSelectMenu()) return
        let result = await inter.execute(this.interaction, this.interaction.customId);
        if(result?.reply) await this.interaction.reply(result.reply);
        if(result?.interaction) global.client.cache.interactions.set(this.interaction.id, result.interaction);
    }
}