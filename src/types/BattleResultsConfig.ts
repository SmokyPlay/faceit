import GameMemberConfig from "@/types/GameMemberConfig";
import {MessageEmbed} from "discord.js";

export default interface BattleResultsConfig {
    winner: 'team1' | 'team2'
    members: Array<GameMemberConfig & {eloChange: number}>
    embed: MessageEmbed
}