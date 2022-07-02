import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";

export default class BalanceManagerCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'баланс-менеджер'
    public description = "Добавляет/забирает деньги или устанавливает баланс участника"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник для управления его балансом",
            required: true
        },
        {
            type: "STRING",
            name: "действие",
            description: "Действие с балансом участника",
            choices: [
                {name: "добавить", value: "add"},
                {name: "забрать", value: "remove"},
                {name: "установить", value: "set"}
            ],
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
        let action = interaction.options.getString("действие");
        if(!member) return {reply: {content: "Участник не найден"}}
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {content: "Участник не зарегистрирован в системе"}}
        let amount = interaction.options.getInteger("количество");
        if(!user.balance) user.balance = 0;
        let result;
        switch (action) {
            case 'add':
                user.balance += amount;
                result = {reply: {content: `Участнику **${member.user.tag}** добавлено ${'`' + amount + '₽`'}`}};
                break;
            case 'remove':
                user.balance -= amount;
                result = {reply: {content: `У участника **${member.user.tag}** отнято ${'`' + amount + '₽`'}`}};
                break;
            case 'set':
                user.balance = amount;
                result = {reply: {content: `Баланс участника **${member.user.tag}** установлен: ${'`' + amount + '₽`'}`}};
                break;
        }
        await global.mongo.save('users', user);
        return result;
    }
}