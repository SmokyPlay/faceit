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
    public name = 'лидеры-репутация'
    public description = "Показывает топ игроков с хорошей или плохой репутацией"
    public options: Array<ApplicationCommandOptionData> = [
        {
            type: "STRING",
            name: "сортировка",
            description: "Сортировать по положительной или отрицательной репутации",
            choices: [
                {name: "положительная", value: "positive"},
                {name: "отрицательная", value: "negative"}
            ],
            required: true
        }
    ]

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let sort = interaction.options.getString("сортировка");
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Лидеры сервера", iconURL: interaction.guild.iconURL({dynamic: true})})
            .setDescription("")
        let users = await global.mongo.find<User>('users');
        sort === "positive" ? users.sort((a, b) => (b.rep ?? 0) - (a.rep ?? 0)) :
            users.sort((a, b) => (a.rep ?? 0) - (b.rep ?? 0));
        users = users.slice(0, 10);
        users.forEach((user, i) => {
            let rep = user.rep ?? 0;
            let emoji = rep >= 0 ? "<:like:1016778645248946346>" : "<:dislike:1016778721820151828>";
            embed.description += `**${(i+1)}.** <@${user.id}> • ${rep} ${emoji}\n`;
        })
        return {reply: {embeds: [embed]}}
    }
}