import LobbyConfig from "@/types/LobbyConfig";
import ModeConfig from "@/types/ModeConfig";
import GameMemberConfig from "@/types/GameMemberConfig";

export default interface PlayersInteractionData {
    members: Array<GameMemberConfig>
    team1: Array<GameMemberConfig>
    team2: Array<GameMemberConfig>
    lobby: LobbyConfig
    modes: Array<ModeConfig>
}