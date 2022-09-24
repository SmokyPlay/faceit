import {
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    CommandInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, VoiceChannel
} from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";
import CommandError from "@/utils/CommandError";
import StartInteraction from "@/interactions/temporary/StartInteraction";
import LobbyConfig from "../types/LobbyConfig";
import properties from '@/properties.json';
import User from "@/types/database/User";
import GameMemberConfig from "@/types/GameMemberConfig";
import ModesInteraction from "@/interactions/temporary/ModesInteraction";

interface CreateTeamsResult {
    team1: Array<GameMemberConfig>
    team2: Array<GameMemberConfig>
}

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
        let team1 = interaction.guild.channels.cache.get(lobby.team1) as VoiceChannel;
        let team2 = interaction.guild.channels.cache.get(lobby.team2) as VoiceChannel;
        if(lobby.two && team1.members.size === 2 && team2.members.size === 2) {
            let teams = await this.createTeams(team1.members.map(m => m), team2.members.map(m => m));
            let embed = new MessageEmbed()
                .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/992898514600349776/unknown.png")
                .setDescription(`Выберите режим, на котором хотите играть\nВыбирает: ${teams.team1.find(m => m.captain).discord.toString()}`)
                .addField("Команда 1",
                    teams.team1.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n") + "\nСчёт: 0", true)
                .addField("Команда 2",
                    teams.team2.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n") + "\nСчёт: 0", true)
            let menu = new MessageSelectMenu()
                .setCustomId(`${interaction.id}-mode`)
                .setPlaceholder(`Выберите режим`)
                .addOptions(properties.modes)
            let row = new MessageActionRow()
                .addComponents(menu)
            let inter = new ModesInteraction({
                id: interaction.id,
                allowedUsers: [teams.team1.find(m => m.captain).discord.id],
                data: {
                    team1: teams.team1,
                    team2: teams.team2,
                    lobby: lobby,
                    modes: JSON.parse(JSON.stringify(properties.modes)),
                    selected: [],
                    oneSelected: false
                },
                reply: {embed, row}
            })
            return {reply: {embeds: [embed], components: [row]}, interaction: inter}
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

    private async createTeams(team1: Array<GuildMember>, team2: Array<GuildMember>): Promise<CreateTeamsResult> {
        let result: CreateTeamsResult = {
            team1: [],
            team2: []
        }
        let captains = [Math.random(), Math.random()]
        for(let member of team1) {
            let brawl = await global.mongo.findOne<User>('users', {id: member.id})
            result.team1.push({
                discord: member,
                brawl,
                captain: captains[0] >= 0.5
            })
        }
        for(let member of team2) {
            let brawl = await global.mongo.findOne<User>('users', {id: member.id})
            result.team2.push({
                discord: member,
                brawl,
                captain: captains[0] >= 0.5
            })
        }
        return result;
    }
}