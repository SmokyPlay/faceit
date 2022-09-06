export default interface User {
    id: string
    brawlTag: string
    elo: number
    battles: number
    victories: number
    defeats: number
    balance: number
    rep: number
    lastRep: Date
    promoCode: string
    promoCodeStarted: Date
}