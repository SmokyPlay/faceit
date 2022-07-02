import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember, MessageEmbed
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import properties from '@/properties.json';
import UserRankConfig from "@/types/UserRankConfig";
import User from "@/types/database/User";
import CommandError from "@/utils/CommandError";

export default class StatisticsCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'статистика'
    public description = "Показывает вашу статистику"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Посмотреть статистику указанного участника",
            required: false
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let ranks: Array<UserRankConfig> = properties.ranks;
        let member = interaction.options.getMember("участник") as GuildMember;
        if(!member) member = interaction.member as GuildMember;
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user)
            return {reply: {embeds: [CommandError.other(member, "Участник не зарегистрирован в системе")]}}
        let rank = ranks.find((r, i) => (user.elo >= r.elo) && (user.elo < ranks[i+1].elo));
        let role = interaction.guild.roles.cache.get(rank.role);
        let embed = new MessageEmbed()
            .setColor(role.hexColor === '#000000' ? '#007ef8' : role.hexColor)
            .setTitle(`Статистика ${member.displayName}`)
            .setThumbnail(member.displayAvatarURL({dynamic: true}))
            .setDescription(`**ELO:** ${user.elo}/${ranks[rank.rank].elo}`)
            .addField("Боёв", user.battles.toString(), true)
            .addField("Побед", user.victories.toString(), true)
            .addField("Поражений", user.defeats.toString(), true)
            .addField("Уровень", rank.rank.toString(), true)
            .addField("Роль", role.toString(), true)
        return {reply: {embeds: [embed]}}
    }
}