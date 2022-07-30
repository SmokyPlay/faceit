import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction,
    GuildMember,
    MessageEmbed, TextChannel
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import Subscription from "@/types/database/Subscription";

export default class ReportCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'жалоба'
    public description = "Отправляет жалобу на участника"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник, на которого нужно пожаловаться",
            required: true
        },
        {
            type: "STRING",
            name: "причина",
            description: "Причина жалобы",
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.member as GuildMember
        let reported = interaction.options.getMember("участник") as GuildMember;
        let reason = interaction.options.getString("причина") as string;
        let embed = new MessageEmbed()
            .setColor('#ff0909')
            .setAuthor({name: `Жалоба на участника ${reported.user.tag}`, iconURL: reported.displayAvatarURL({dynamic: true})})
            .setDescription(`**Причина:** ${reason}`)
            .addField("Участник", reported.toString(), true)
            .addField("Жалобу отправил", member.toString(), true)
        let channel = interaction.guild.channels.cache.get("790843189552087050") as TextChannel;
        await channel.send({embeds: [embed]});
        return {reply: {content: `Жалоба на участника **${reported.user.tag}** отправлена`}}
    }
}