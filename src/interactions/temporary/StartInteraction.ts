import Discord from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import StartInteractionDataConfig from "@/types/InteractionsData/StartInteractionDataConfig";
import CommandError from "@/utils/CommandError";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import ModesInteraction from "@/interactions/temporary/ModesInteraction";
import ReplaceType from "@/types/utils/ReplaceType";

import properties from "@/properties.json";
import User from "@/types/database/User";

export default class StartInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: StartInteractionDataConfig

    public constructor(options: ReplaceType<InteractionConfig, 'data', StartInteractionDataConfig>) {
        super(options);
    }

    private async ready(interaction: Discord.ButtonInteraction): Promise<InteractionExecutionResultConfig> {
        let member = interaction.member as Discord.GuildMember;
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
            await this.CreateTeams()
            this.reply.embed.fields = [];
            this.reply.embed
                .setDescription(`Выберите режим, на котором хотите играть\nВыбирает: ${this.data.team1.find(m => m.captain).discord.toString()}`)
                .addField("Команда 1",
                    this.data.team1.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n"), true)
                .addField("Команда 2",
                    this.data.team2.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n"), true)
            let menu = new Discord.MessageSelectMenu()
                .setCustomId(`${interaction.id}-mode`)
                .setPlaceholder(`Выберите режим`)
                .addOptions(properties.modes)
            this.reply.row = new Discord.MessageActionRow()
                .setComponents(menu)
            await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]});
            let inter = new ModesInteraction({
                id: interaction.id,
                allowedUsers: [this.data.team1.find(m => m.captain).discord.id],
                data: {
                    team1: this.data.team1,
                    team2: this.data.team2,
                    lobby: this.data.lobby,
                    modes: JSON.parse(JSON.stringify(properties.modes)),
                    selected: [],
                    oneSelected: false
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

    private async CreateTeams(): Promise<void> {
        for(let i = 0; i < 3; i++) {
            let player = this.data.members[Math.floor(this.data.members.length * Math.random())]
            //await player.discord.voice?.setChannel(this.data.lobby.team1).catch(() => {});
            this.data.team1.push(player)
            this.data.members.splice(this.data.members.indexOf(player), 1);
        }
        for(let i = 0; i < 3; i++) {
            let player = this.data.members[i];
            //await player.discord.voice?.setChannel(this.data.lobby.team2).catch(() => {});
            this.data.team2.push(player)
        }
        this.data.members = []
        this.data.team1[Math.floor(this.data.team1.length * Math.random())].captain = true;
        this.data.team2[Math.floor(this.data.team2.length * Math.random())].captain = true;
    }
}