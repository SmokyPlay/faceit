import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import CommandError from "@/utils/CommandError";
import StartInteraction from "@/interactions/temporary/StartInteraction";
import LobbyConfig from "../types/LobbyConfig";
import properties from '@/properties.json';
import User from "@/types/database/User";

export default class StartCommand extends AbstractCommand implements ChatInputApplicationCommandData {
    public name = 'старт'
    public description = "Запускает игру в текущем лобби"
    public options: Array<ApplicationCommandOptionData> = []

    public async execute(interaction: CommandInteraction): Promise<CommandExecutionResultConfig> {
        let member = interaction.member as GuildMember;
        let lobby: LobbyConfig = properties.lobbies.find(l => l.voice === member.voice?.channel?.id);
        if(!lobby) {
            return {reply: {embeds:
                        [CommandError.other(member, "Эту команду можно использовать только находясь в лобби")]}}
        }
        let playersCount = lobby.two ? 4 : 6;
        if(member.voice.channel.members.size < playersCount) {
            return {reply: {embeds: [
                CommandError.other(member, `Для начала игры в лобби должно быть ${playersCount} игроков`,
                    "Недостаточно игроков")], ephemeral: true}}
        }
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {embeds:
                    [CommandError.other(member, "Вы не зарегистрированы в системе")]}}
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/992896887554322506/search.png")
            .setTitle("Игра")
            .setDescription("Нажмите `Готово` чтобы присоединиться")
            .addField("Участники", member.toString())
        let readyButton = new MessageButton()
            .setCustomId(`${interaction.id}-ready`)
            .setStyle("PRIMARY")
            .setLabel("Готово")
        let leaveButton = new MessageButton()
            .setCustomId(`${interaction.id}-leave`)
            .setStyle("DANGER")
            .setLabel("Выйти")
        let row = new MessageActionRow()
            .addComponents(readyButton, leaveButton);
        let inter = new StartInteraction({
            id: interaction.id,
            allowedUsers: null,
            data: {
                members: [{discord: member, brawl: user, captain: false}],
                lobby: lobby,
                team1: [],
                team2: []
            },
            reply: {embed: embed, row: row}
        })
        return {
            reply: {embeds: [embed], components: [row]},
            interaction: inter
        }
    }
}