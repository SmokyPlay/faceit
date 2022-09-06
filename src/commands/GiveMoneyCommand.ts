import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import PromoCode from "@/types/database/PromoCode";

export default class GiveMoneyCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'передать-деньги'
    public description = "Передает участнику указанное количество ваших денег"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник для передачи денег",
            required: true
        },
        {
            type: "INTEGER",
            name: "количество",
            description: "Количество денег",
            minValue: 1,
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let user = await global.mongo.findOne<User>('users', {id: interaction.member.user.id});
        if(!user) return {reply: {content: "Вы не зарегистрированы в системе"}}
        let member = interaction.options.getMember("участник") as GuildMember;
        let amount = interaction.options.getInteger("количество") as number;
        if(!member) return {reply: {content: "Участник не найден"}}
        let user2 = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user2) return {reply: {content: "Участник не зарегистрирован в системе"}}
        if(user.balance < amount) return {reply: {content: "У вас недостаточно денег"}}
        user.balance-= amount;
        if(!user2.balance) user2.balance = 0;
        user2.balance += amount;
        await global.mongo.save('users', user);
        await global.mongo.save('users', user2);
        return {reply: {content: `Вы передали ${amount}₽ участнику **${member.user.tag}**`}}
    }
}