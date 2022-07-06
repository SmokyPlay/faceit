import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";

export default class DeleteAccountCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'удалить-аккаунт'
    public description = "Удаляет аккаунт указанного пользователя из системы"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник для удаления его аккаунта",
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.options.getMember("участник") as GuildMember;
        if(!member) return {reply: {content: "Участник не найден"}}
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {content: "Участник не зарегистрирован в системе"}}
        await global.mongo.delete('users', {id: member.id});
        await member.setNickname(null);
        await member.roles.add("782544002544959518");
        return {reply: {content: `Аккаунт участника **${member.user.tag}** удален`}};
    }
}