import PlayerConfig from "@/types/BrawlStars/PlayerConfig";

export default interface BattleConfig {
    mode: string
    result: 'victory' | 'defeat'
    type: string
    rank: number
    trophyChange: number
    starPlayer: PlayerConfig
    teams: Array<Array<PlayerConfig>>
}