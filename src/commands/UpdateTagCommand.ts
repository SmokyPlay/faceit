import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";

export default class UpdateTagCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'изменить-тег'
    public description = "Обновляет бравл тэг указанного пользователя в системе"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник для обновления его тега",
            required: true
        },
        {
            type: "STRING",
            name: "тег",
            description: "Новый тег участника",
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.options.getMember("участник") as GuildMember;
        let tag = interaction.options.getString("тег");
        tag = tag.toUpperCase();
        if(!member) return {reply: {content: "Участник не найден"}}
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {content: "Участник не зарегистрирован в системе"}}
        let account = await global.brawl.playerByTag(tag).catch(() => undefined);
        if(!account) return {reply: {content: "Аккаунт с таким тегом не найден"}};
        user.brawlTag = account.tag;
        await member.setNickname(account.name + ' ' + account.tag).catch(() => {});
        await global.mongo.save('users', user);
        return {reply: {content: `Тег участника **${member.user.tag}** обновлен: ${"`" + account.tag + "`"}`}};
    }
}