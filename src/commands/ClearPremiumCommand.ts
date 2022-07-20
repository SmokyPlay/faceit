import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import PromoCode from "@/types/database/PromoCode";

export default class ClearPremiumCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'очистить-премиум'
    public description = "Забирает премиум подписки у всех пользователей"
    public options: Array<ApplicationCommandOptionData> = []

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let role = interaction.guild.roles.cache.get("994986856481566780");
        role.members.forEach(member => {
            member.roles.remove(role);
        })
        return {reply: {content: `Премиум подписки были очищены`}};
    }
}