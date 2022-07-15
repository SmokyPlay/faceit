import {MessageButton, MessageSelectMenu, SelectMenuInteraction} from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import EndInteraction from "@/interactions/temporary/EndInteraction";
import ModesInteractionData from "@/types/InteractionsData/ModesInteractionData";

import properties from "@/properties.json";
import ReplaceType from "@/types/utils/ReplaceType";

export default class ModesInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: ModesInteractionData

    public constructor(options: ReplaceType<InteractionConfig, 'data', ModesInteractionData>) {
        super(options);
    }

    private async mode(interaction: SelectMenuInteraction): Promise<InteractionExecutionResultConfig> {
        let value = interaction.values[0];
        let mode = this.data.modes.find(m => m.value === value);
        if(!this.data.oneSelected) {
            this.data.selected.push(mode);
            this.data.modes.splice(this.data.modes.indexOf(mode), 1);
            this.allowedUsers = [this.data.team2.find(m => m.captain).discord.id];
            this.reply.embed
                .setColor('#007ef8')
                .setDescription(`Выберите режим, на котором хотите играть\nВыбирает: ${this.data.team2.find(m => m.captain).discord.toString()}`)
            let menu = this.reply.row.components[0] as MessageSelectMenu;
            menu.setOptions(this.data.modes);
            this.reply.row.setComponents(menu)
            await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]});
            this.data.oneSelected = true;
            return {ended: false};
        }
        else {
            let maps = properties.maps;
            this.data.selected.push(mode);
            this.data.modes.splice(this.data.modes.indexOf(mode), 1);
            let randomMode = this.data.modes[Math.floor(this.data.modes.length * Math.random())]
            this.data.selected.push(randomMode);
            this.reply.embed
                .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/992899959592595536/unknown.png")
                .setDescription(`Игра создана!\n` +
                    this.data.selected
                        .map((mode, i) => `Игра ${i+1}: ${'`' + mode.label + '`'}, карта: ${'`' + maps[mode.value][Math.floor(Math.random()*maps[mode.value].length)]}` + '`').join("\n")
                    + `\nПо окончании игры нажмите ${'`' + "Закончить" + '`'}`)
            let button = new MessageButton()
                .setCustomId(`${interaction.id}-end`)
                .setStyle("PRIMARY")
                .setLabel("Закончить")
                .setDisabled(true)
            this.reply.row.setComponents(button)
            await this.SetVoiceChannels();
            let inter = new EndInteraction({
                id: interaction.id,
                allowedUsers: null,
                data: {
                    team1: this.data.team1,
                    team2: this.data.team2,
                    lobby: this.data.lobby,
                    modes: this.data.selected,
                    startedAt: interaction.createdAt
                },
                reply: this.reply
            })
            await interaction.editReply({embeds: [this.reply.embed], components: [this.reply.row]});
            setTimeout(async () => {
                this.reply.row.components[0].setDisabled(false);
                await interaction.editReply({components: [this.reply.row]});
            }, 5000)
            return {ended: true, interaction: inter};
        }
    }

    private async SetVoiceChannels() {
        for(let i = 0; i < 3; i++) {
            await this.data.team1[i].discord.voice.setChannel(this.data.lobby.team1);
        }
        for(let i = 0; i < 3; i++) {
            await this.data.team2[i].discord.voice.setChannel(this.data.lobby.team2);
        }
    }
}