import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import PromoCode from "@/types/database/PromoCode";

export default class BonusCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'бонус'
    public description = "Добавляет деньги участнику, игнорируя его промокод"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник для выдачи бонуса",
            required: true
        },
        {
            type: "INTEGER",
            name: "количество",
            description: "Количество денег",
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.options.getMember("участник") as GuildMember;
        let amount = interaction.options.getInteger("количество");
        if(!member) return {reply: {content: "Участник не найден"}}
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {content: "Участник не зарегистрирован в системе"}}
        if(!user.balance) user.balance = 0;
        user.balance += amount;
        await global.mongo.save('users', user);
        return {reply: {content: `Участнику **${member.user.tag}** выдан бонус ${'`' + amount + '₽`'}`}};
    }
}