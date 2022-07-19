import { ButtonInteraction, GuildMember, MessageActionRow,MessageSelectMenu } from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import StartInteractionData from "@/types/InteractionsData/StartInteractionData";
import CommandError from "@/utils/CommandError";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import ModesInteraction from "@/interactions/temporary/ModesInteraction";
import ReplaceType from "@/types/utils/ReplaceType";

import properties from "@/properties.json";
import User from "@/types/database/User";
import PlayersInteraction from "@/interactions/temporary/PlayersInteraction";
import GameMemberConfig from "@/types/GameMemberConfig";

export default class StartInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: StartInteractionData

    public constructor(options: ReplaceType<InteractionConfig, 'data', StartInteractionData>) {
        super(options);
    }

    private async ready(interaction: ButtonInteraction): Promise<InteractionExecutionResultConfig> {
        let member = interaction.member as GuildMember;
        if(member.voice?.channel?.id !== this.data.lobby.voice) {
            await interaction.followUp({embeds: [CommandError.other(member, "Вас нет в лобби, в котором проходит игра")], ephemeral: true})
            return {ended: false}
        }
        if(this.data.members.find(m => m.discord === member)) {
            await interaction.followUp({embeds: [CommandError.other(member, "Вы уже присоединились к этой игре")], ephemeral: true})
            return {ended: false}
        }
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(!user) {
            await interaction.followUp({embeds: [CommandError.other(member, "Вы не зарегистрированы в системе")], ephemeral: true})
            return {ended: false}
        }
        this.data.members.push({discord: member, brawl: user, captain: false});
        if(this.data.members.length === 6) {
            await interaction.editReply({components: []});
            await this.CreateCaptains();
            this.reply.embed.fields = [];
            this.reply.embed
                .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/992898514600349776/unknown.png")
                .setDescription(`Выберите игрока в свою команду\nВыбирает: ${this.data.team1.find(m => m.captain).discord.toString()}`)
                .addField("Команда 1",
                    this.data.team1.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n"), true)
                .addField("Команда 2",
                    this.data.team2.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n"), true)
                .addField("Участники", this.data.members.map(memb => memb.discord.toString()).join("\n"))
            let menu = new MessageSelectMenu()
                .setCustomId(`${interaction.id}-player`)
                .setPlaceholder(`Выберите игрока`)
                .addOptions(this.data.members.map(memb => {return {label: memb.discord.displayName, value: memb.discord.id}}))
            this.reply.row = new MessageActionRow()
                .setComponents(menu)
            await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]});
            let inter = new PlayersInteraction({
                id: interaction.id,
                allowedUsers: [this.data.team1.find(m => m.captain).discord.id],
                data: {
                    members: this.data.members,
                    team1: this.data.team1,
                    team2: this.data.team2,
                    lobby: this.data.lobby,
                    modes: JSON.parse(JSON.stringify(properties.modes)),
                },
                reply: this.reply
            })
            return {ended: true, interaction: inter};
        }
        else {
            this.reply.embed.fields = [];
            this.reply.embed
                .addField("Участники", this.data.members.map(memb => memb.discord.toString()).join("\n"))
            await interaction.editReply({embeds: [this.reply.embed]});
        }
        return {ended: false};
    }

    private CreateCaptains() {
        let players: Array<GameMemberConfig> = [];
        this.data.members.forEach(member => {
            if(member.discord.roles.cache.get("994986856481566780")) players.push(member, member);
            else players.push(member);
        })
        console.log(players);
        let player = players[Math.floor(players.length * Math.random())]
        player.captain = true;
        this.data.team1.push(player)
        this.data.members.splice(this.data.members.indexOf(player), 1);
        players.splice(players.indexOf(player), 1);
        if(players.includes(player)) players.splice(players.indexOf(player), 1);
        player = players[Math.floor(players.length * Math.random())]
        player.captain = true;
        this.data.team2.push(player)
        this.data.members.splice(this.data.members.indexOf(player), 1);
    }
}