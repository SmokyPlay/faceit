import {MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction} from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import EndInteraction from "@/interactions/temporary/EndInteraction";
import ModesInteractionData from "@/types/InteractionsData/ModesInteractionData";

import properties from "@/properties.json";
import ReplaceType from "@/types/utils/ReplaceType";
import PlayersInteractionData from "@/types/InteractionsData/PlayersInteractionData";
import ModesInteraction from "@/interactions/temporary/ModesInteraction";
import {emit} from "cluster";

export default class PlayersInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: PlayersInteractionData

    public constructor(options: ReplaceType<InteractionConfig, 'data', PlayersInteractionData>) {
        super(options);
    }

    private async player(interaction: SelectMenuInteraction): Promise<InteractionExecutionResultConfig> {
        let value = interaction.values[0];
        let player = this.data.members.find(m => m.discord.id === value);
        let team: 'team1' | 'team2' = this.data.members.length === 4 ? 'team1' : 'team2';
        this.data[team].push(player);
        this.data.members.splice(this.data.members.indexOf(player), 1);
        let menu = this.reply.row.components[0] as MessageSelectMenu;
        menu.setOptions(this.data.members.map(memb => {return {label: memb.discord.displayName, value: memb.discord.id}}));
        this.reply.row.setComponents(menu);
        let nextSelecting = this.data.team2.find(memb => memb.captain);
        this.reply.embed.fields = [];
        this.reply.embed
            .setDescription(`Выберите игрока в свою команду\nВыбирает: ${nextSelecting.discord.toString()}`)
            .addField("Команда 1",
                this.data.team1.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                    .join("\n"), true)
            .addField("Команда 2",
                this.data.team2.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                    .join("\n"), true)
            .addField("Участники", this.data.members.map(memb => memb.discord.toString()).join("\n"))
        this.allowedUsers = [nextSelecting.discord.id];
        if(this.data.members.length <= 1) {
            this.data.team1.push(this.data.members[0])
            this.data.members = [];
            await interaction.editReply({components: []});
            this.reply.embed.fields = [];
            this.reply.embed
                .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/992898514600349776/unknown.png")
                .setDescription(`Выберите режим, на котором хотите играть\nВыбирает: ${this.data.team1.find(m => m.captain).discord.toString()}`)
                .addField("Команда 1",
                    this.data.team1.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n") + "Счёт: 0", true)
                .addField("Команда 2",
                    this.data.team2.map(memb => memb.discord.toString() + (memb.captain ? '⭐' : ''))
                        .join("\n") + "Счёт: 0", true)
            let menu = new MessageSelectMenu()
                .setCustomId(`${interaction.id}-mode`)
                .setPlaceholder(`Выберите режим`)
                .addOptions(properties.modes)
            this.reply.row = new MessageActionRow()
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
            await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]})
            return {ended: true, interaction: inter};
        }
        await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]})
        return {ended: false};
    }
}