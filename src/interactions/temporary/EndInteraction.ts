import {GuildMember, SelectMenuInteraction, TextChannel} from "discord.js";

import AbstractInteraction from "@/abstractions/AbstractInteraction";
import InteractionConfig from "@/types/InteractionConfig";
import EndInteractionData from "@/types/InteractionsData/EndInteractionData";
import InteractionExecutionResultConfig from "@/types/InteractionExecutionResultConfig";
import ReplaceType from "@/types/utils/ReplaceType";
import BattleResults from "@/utils/BattleResults";
import CommandError from "@/utils/CommandError";
import BattleTimeParser from "@/utils/BattleTimeParser";

export default class EndInteraction extends AbstractInteraction implements InteractionConfig {
    public declare data: EndInteractionData

    public constructor(options: ReplaceType<InteractionConfig, 'data', EndInteractionData>) {
        super(options);
    }

    private async end(interaction: SelectMenuInteraction): Promise<InteractionExecutionResultConfig> {
        let member = interaction.member as GuildMember;
        let logs = await global.brawl.battleLog(this.data.team1.find(m => m.captain).brawl.brawlTag);
        let log = logs.items.filter(l => BattleTimeParser(l.battleTime) > this.data.startedAt).map(l => l.battle);
        console.log("Game ended, logs length:", log.length);
        let results = await BattleResults.BattleResults(this.data, log);
        if(!results) {
            this.reply.row.components[0].setDisabled(true);
            await interaction.editReply({components: [this.reply.row]})
            await interaction.followUp({embeds: [
                CommandError.other(member, "Бой еще не окончен, либо лобби было создано неправильно. Повторите попытку через 30 секунд")]
            })
            setTimeout(async () => {
                this.reply.row.components[0].setDisabled(false);
                await interaction.editReply({components: [this.reply.row]})
            }, 30000)
            return {ended: false}
        }
        this.reply.embed.fields = [];
        this.reply.embed
            .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/992901019283488818/unknown.png")
            .setDescription(`Игра окончена!\nПобедила команда #${results.winner.replace('team', '')}`)
            .addField("Команда 1",
                this.data.team1.map(memb =>
                    (results.members.find(m => m === memb).eloChange >= 0 ? '<:up:992903003264778353> ' : '<:down:992903114543869952> ')
                    + memb.discord.toString() + ' '
                    + (results.members.find(m => m === memb).eloChange >= 0 ? '+' : '')
                    + `${results.members.find(m => m === memb).eloChange} ELO`)
                    .join("\n"), true)
            .addField("Команда 2",
                this.data.team2.map(memb =>
                    (results.members.find(m => m === memb).eloChange >= 0 ? '<:up:992903003264778353> ' : '<:down:992903114543869952> ')
                    + memb.discord.toString() + ' '
                    + (results.members.find(m => m === memb).eloChange >= 0 ? '+' : '')
                    + `${results.members.find(m => m === memb).eloChange} ELO`)
                    .join("\n"), true)
        await interaction.editReply({embeds: [this.reply.embed]})
        let resultsChannel = interaction.guild.channels.cache.get(this.data.lobby.results) as TextChannel
        await resultsChannel.send({embeds: [this.reply.embed]});
        return {ended: true}
    }
}