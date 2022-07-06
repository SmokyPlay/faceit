import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import User from "@/types/database/User";
import LeaderboardInteraction from "@/interactions/temporary/LeaderboardInteraction";

export default class LeaderboardCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'лидеры'
    public description = "Показывает список лидеров сервера"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "INTEGER",
            name: "страница",
            description: "Страница топа",
            required: false
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let page = interaction.options.getInteger("страница");
        if(page <= 0) page = 1;
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setTitle("Лидеры сервера")
            .setDescription("")
        let users = await global.mongo.find<User>('users');
        let pages = 3;
        if(page > pages) page = pages;
        users.sort((a, b) => b.elo - a.elo);
        users = users.slice((page-1)*10, page*10);
        users.forEach((user, i) => {
            embed.description += `**${(page-1)*10 + (i+1)}.** <@${user.id}> • ${user.elo} ELO\n`;
        })
        embed.setFooter({text: `Страница ${page}/${pages}`})
        let forwardButton = new MessageButton()
            .setCustomId(`${interaction.id}-forward`)
            .setStyle("PRIMARY")
            .setEmoji("➡")
            .setDisabled(page === pages)
        let backwardButton = new MessageButton()
            .setCustomId(`${interaction.id}-backward`)
            .setStyle("PRIMARY")
            .setEmoji("⬅")
            .setDisabled(page === 1)
        let row = new MessageActionRow()
            .setComponents(backwardButton, forwardButton);
        let inter = new LeaderboardInteraction({
            id: interaction.id,
            allowedUsers: [interaction.member.user.id],
            data: {
                page: page
            },
            reply: {embed: embed, row: row}
        })
        return {reply: {embeds: [embed], components: [row]}, interaction: inter}
    }
}