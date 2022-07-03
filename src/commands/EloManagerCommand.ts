import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import properties from '@/properties.json'
import UserRankConfig from "@/types/UserRankConfig";

export default class EloManagerCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'эло-менеджер'
    public description = "Добавляет/забирает деньги или устанавливает эло участника"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник для управления его эло",
            required: true
        },
        {
            type: "STRING",
            name: "действие",
            description: "Действие с эло участника",
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
            description: "Количество эло",
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let ranks: Array<UserRankConfig> = properties.ranks;
        let member = interaction.options.getMember("участник") as GuildMember;
        let action = interaction.options.getString("действие");
        if(!member) return {reply: {content: "Участник не найден"}}
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {content: "Участник не зарегистрирован в системе"}}
        let amount = interaction.options.getInteger("количество");
        if(!user.elo) user.elo = 100;
        let result;
        await member.roles.remove(ranks.find(r => r.elo === user.elo).role);
        switch (action) {
            case 'add':
                user.elo += amount;
                result = {reply: {content: `Участнику **${member.user.tag}** добавлено ${'`' + amount + ' ELO`'}`}};
                break;
            case 'remove':
                user.elo -= amount;
                result = {reply: {content: `У участника **${member.user.tag}** отнято ${'`' + amount + ' ELO`'}`}};
                break;
            case 'set':
                user.elo = amount;
                result = {reply: {content: `Эло участника **${member.user.tag}** установлено: ${'`' + amount + ' ELO`'}`}};
                break;
        }
        let rank = ranks.find((r, i) => r.elo <= user.elo && ranks[i+1].elo > user.elo);
        await member.roles.add(rank.role);
        await global.mongo.save('users', user);
        return result;
    }
}