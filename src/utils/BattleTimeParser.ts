export default function BattleTimeParser(battleTime: string): Date {
    let date = battleTime.split('T')[0];
    let time = battleTime.split('T')[1];
    return new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}.000Z`)
}