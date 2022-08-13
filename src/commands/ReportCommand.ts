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
    public name = 'репорт'
    public description = "Отправляет репорт на участника"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "USER",
            name: "участник",
            description: "Участник, на которого нужно отправить репорт",
            required: true
        },
        {
            type: "STRING",
            name: "причина",
            description: "Причина репорта",
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.member as GuildMember
        let reported = interaction.options.getMember("участник") as GuildMember;
        let reason = interaction.options.getString("причина") as string;
        let embed = new MessageEmbed()
            .setColor('#ff0909')
            .setAuthor({name: `Репорт на участника ${reported.user.tag}`, iconURL: reported.displayAvatarURL({dynamic: true})})
            .setDescription(`**Причина:** ${reason}`)
            .addField("Участник", reported.toString(), true)
            .addField("Репорт отправил", member.toString(), true)
        let channel = interaction.guild.channels.cache.get("790843189552087050") as TextChannel;
        await channel.send({content: `${member.toString()}, ${reported.toString()}`, embeds: [embed]}).then(msg => msg.startThread({name: "Репорт"}));
        return {reply: {content: `Репорт на участника **${reported.user.tag}** отправлен`}}
    }
}