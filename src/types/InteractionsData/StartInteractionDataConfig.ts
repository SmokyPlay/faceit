import LobbyConfig from "@/types/LobbyConfig";
import GameMemberConfig from "@/types/GameMemberConfig";

export default interface StartInteractionDataConfig {
    members: Array<GameMemberConfig>
    team1: Array<GameMemberConfig>
    team2: Array<GameMemberConfig>
    lobby: LobbyConfig
}