import Discord from "discord.js";
import LobbyConfig from "@/types/LobbyConfig";
import ModeConfig from "@/types/ModeConfig";
import GameMemberConfig from "@/types/GameMemberConfig";

export default interface StartInteractionDataConfig {
    members: Array<Discord.GuildMember>
    team1: Array<GameMemberConfig>
    team2: Array<GameMemberConfig>
    lobby: LobbyConfig
}