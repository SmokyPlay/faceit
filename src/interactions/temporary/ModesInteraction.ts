import Discord from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import InteractionReplyConfig from "@/types/InteractionReplyConfig";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import EndInteraction from "@/interactions/temporary/EndInteraction";
import ModesInteractionDataConfig from "@/types/InteractionsData/ModesInteractionDataConfig";

import properties from "@/properties.json";
import ReplaceType from "@/types/utils/ReplaceType";
import StartInteractionDataConfig from "@/types/InteractionsData/StartInteractionDataConfig";

export default class ModesInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: ModesInteractionDataConfig

    public constructor(options: ReplaceType<InteractionConfig, 'data', ModesInteractionDataConfig>) {
        super(options);
    }

    private async mode(interaction: Discord.SelectMenuInteraction): Promise<InteractionExecutionResultConfig> {
        let value = interaction.values[0];
        let mode = this.data.modes.find(m => m.value === value);
        if(!this.data.oneSelected) {
            this.data.modes.splice(this.data.modes.indexOf(mode), 1);
            this.allowedUsers = [this.data.team2.find(m => m.captain).discord.id];
            this.reply.embed
                .setColor('#007ef8')
                .setDescription(`Выберите режим, на котором __не хотите__ играть\nВыбирает: ${this.data.team2.find(m => m.captain).discord.toString()}`)
            await interaction.editReply({embeds: [this.reply.embed]});
            this.data.oneSelected = true;
            return {ended: false};
        }
        else {
            this.data.modes.splice(this.data.modes.indexOf(mode), 1);
            let randomMode = this.data.modes[Math.floor(this.data.modes.length * Math.random())]
            this.reply.embed
                .setDescription(`Игра создана!\nРежим: ${"`" + randomMode.label + "`"}\nПо окончании игры нажмите ${'`' + "Закончить" + '`'}`)
                .setThumbnail(interaction.guild.emojis.cache.get(randomMode.emoji).url)
            let button = new Discord.MessageButton()
                .setCustomId(`${interaction.id}-end`)
                .setStyle("PRIMARY")
                .setLabel("Закончить")
                .setDisabled(true)
            this.reply.row.setComponents(button)
            let inter = new EndInteraction({
                id: interaction.id,
                allowedUsers: null,
                data: {
                    team1: this.data.team1,
                    team2: this.data.team2,
                    lobby: this.data.lobby,
                    mode: randomMode
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
}