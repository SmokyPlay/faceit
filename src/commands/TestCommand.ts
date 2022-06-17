import Discord from "discord.js";
import AbstractCommand from "@/abstractions/AbstractCommand";
import AbstractInteraction from "../abstractions/AbstractInteraction";
import TestInteraction from "../interactions/temporary/TestInteraction";
import CommandExecutionResultConfig from "@/types/CommandExecutionResultConfig";

export default class TestCommand extends AbstractCommand implements Discord.ChatInputApplicationCommandData {
    public name = 'тест'
    public description = "Делает хуйню с вашим числом"
    public options: Array<Discord.ApplicationCommandOptionData> = [
        {
            type: "NUMBER",
            name: "число",
            description: "Ахуеть просто рандомное число",
            required: true
        }
    ]

    public async execute(interaction: Discord.CommandInteraction): Promise<CommandExecutionResultConfig> {
        let number: number = interaction.options.getNumber("число");
        let plusButton = new Discord.MessageButton()
            .setCustomId(`${interaction.id}-plus`)
            .setStyle("SUCCESS")
            .setLabel("Плюс")
        let minusButton = new Discord.MessageButton()
            .setCustomId(`${interaction.id}-minus`)
            .setStyle("DANGER")
            .setLabel("Минус")
        let stopButton = new Discord.MessageButton()
            .setCustomId(`${interaction.id}-stop`)
            .setStyle("SECONDARY")
            .setLabel("Стоп")
        let row = new Discord.MessageActionRow()
            .addComponents(plusButton, minusButton, stopButton);
        let inter = new TestInteraction({
            id: interaction.id,
            allowedUsers: [interaction.user.id],
            data: {number: number}
        })
        return {
            reply: {content: `Число ${number}`, components: [row]},
            interaction: inter
        }
    }
}