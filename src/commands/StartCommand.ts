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
        if(member.voice.channel.members.size < 6) {
            return {reply: {embeds: [
                CommandError.other(member, "Для начала игры в лобби должно быть 6 игроков",
                    "Недостаточно игроков")], ephemeral: true}}
        }
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) return {reply: {embeds:
                    [CommandError.other(member, "Вы не зарегистрированы в системе")]}}
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setTitle("Игра")
            .setDescription("Нажмите `Готово` чтобы присоединиться")
            .addField("Участники", member.toString())
        let readyButton = new MessageButton()
            .setCustomId(`${interaction.id}-ready`)
            .setStyle("PRIMARY")
            .setLabel("Готово")
        let row = new MessageActionRow()
            .addComponents(readyButton);
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