export default interface User {
    id: string
    brawlTag: string
    elo: number
    battles: number
    victories: number
    defeats: number
    balance: number
    promoCode: string
    promoCodeStarted: Date
}