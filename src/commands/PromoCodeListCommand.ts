import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember, MessageEmbed
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import PromoCode from "@/types/database/PromoCode";

export default class PromoCodeManagerCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'промокод-список'
    public description = "Показывает список всех промокодов"
    public options: Array<ApplicationCommandOptionData> = []

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Промокоды", iconURL: interaction.guild.iconURL({dynamic: true})})
            .setDescription("")
        let promoCodes = await global.mongo.find<PromoCode>('promoCodes');
        promoCodes.forEach((promoCode, i) => {
            embed.description += `${"`" + promoCode.code + "`"} • ${promoCode.balance}₽`;
        })
        return {reply: {embeds: [embed]}};
    }
}