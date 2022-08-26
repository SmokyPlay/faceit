import LobbyConfig from "@/types/LobbyConfig";
import ModeConfig from "@/types/ModeConfig";
import GameMemberConfig from "@/types/GameMemberConfig";
import GameCountConfig from "@/types/GameCountConfig";

export default interface EndInteractionData {
    team1: Array<GameMemberConfig>
    team2: Array<GameMemberConfig>
    lobby: LobbyConfig
    modes: Array<ModeConfig>
    startedAt: Date
    count: GameCountConfig
}