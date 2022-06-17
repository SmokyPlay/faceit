import GameMemberConfig from "@/types/GameMemberConfig";

export default interface BattleResultsConfig {
    winner: 'team1' | 'team2'
    members: Array<GameMemberConfig & {eloChange: number}>
}