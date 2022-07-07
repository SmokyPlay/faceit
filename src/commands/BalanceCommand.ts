import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction,
    GuildMember,
    MessageEmbed
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import Subscription from "@/types/database/Subscription";

export default class StatisticsCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'баланс'
    public description = "Показывает ваш баланс"
    public options: Array<ApplicationCommandOptionData> = []

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.member as GuildMember
        let user = await global.mongo.findOne<User>('users', {id: interaction.user.id});
        if(!user) return {reply: {content: "Вы не зарегистрированы в системе"}}
        let subscription = await global.mongo.findOne<Subscription>('subscriptions', {id: member.id});
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Баланс", iconURL: member.displayAvatarURL({dynamic: true})})
            .setDescription(`Ваш баланс: ${user.balance ?? 0}₽`)
        if(subscription)
            embed.addField("Подписка заканчивается", subscription.ends.toLocaleString('ru', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }))
        if(user.promoCode) embed.addField("Код автора", user.promoCode);
        return {reply: {embeds: [embed]}}
    }
}