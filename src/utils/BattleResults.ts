import EndInteractionDataConfig from "@/types/InteractionsData/EndInteractionDataConfig";
import BattleConfig from "@/types/BrawlStars/BattleConfig";
import BattleResultsConfig from "@/types/BattleResultsConfig";
import GameMemberConfig from "@/types/GameMemberConfig";
import properties from '@/properties.json';
import UserRankConfig from "@/types/UserRankConfig";

export default async function BattleResults (data: EndInteractionDataConfig, log: BattleConfig): Promise<BattleResultsConfig> {
    console.log(data);
    console.log(log);
    let ranks: Array<UserRankConfig> = properties.ranks;
    console.log(log.mode)
    console.log(data.mode.value)
    if(log.mode !== data.mode.value) return null;
    let team1: boolean;
    console.log(data.team1, data.team2);
    console.log(log.teams[0])
    console.log(data.team1[0])
    console.log(data.team2[0])
    if(log.teams[0].find(p => p.tag === data.team1[0].brawl.brawlTag)) team1 = true;
    else if(log.teams[0].find(p => p.tag === data.team2[0].brawl.brawlTag)) team1 = false;
    else return null;
    let valid: boolean;
    data[team1 ? "team1" : "team2"].forEach(member => {
        console.log(log.teams[0].find(m => m.tag === member.brawl.brawlTag))
        console.log(member)
        valid = !!log.teams[0].find(m => m.tag === member.brawl.brawlTag);
    })
    data[!team1 ? "team1" : "team2"].forEach(member => {
        console.log(log.teams[0].find(m => m.tag === member.brawl.brawlTag))
        console.log(member)
        valid = !!log.teams[1].find(m => m.tag === member.brawl.brawlTag);
    })
    console.log(valid)
    if(!valid) return null;
    let winner: 'team1' | 'team2' = log.result === 'victory' ? 'team1' : 'team2';
    let members: Array<GameMemberConfig & {eloChange: number}> = [];
    for(let member of data.team1.concat(data.team2)) {
        let rank = ranks.find((r, i) => (member.brawl.elo >= r.elo) && (member.brawl.elo < ranks[i+1].elo));
        if(data[winner].includes(member)) {
            members.push(Object.assign(member, {eloChange: rank.victory}))
            member.brawl.elo += rank.victory;
            member.brawl.battles++;
            member.brawl.victories++;
            if(member.brawl.elo >= ranks[rank.rank].elo) {
                await member.discord.roles.remove(rank.role);
                await member.discord.roles.add(ranks[rank.rank].role);
            }
        }
        else {
            member.brawl.elo += rank.defeat;
            member.brawl.battles++;
            member.brawl.defeats++;
            members.push(Object.assign(member, {eloChange: rank.defeat}))
            if(member.brawl.elo < 0) member.brawl.elo = 0;
            if(member.brawl.elo < rank.elo) {
                await member.discord.roles.remove(rank.role);
                await member.discord.roles.add(ranks[rank.rank-2].role);
            }
        }
        await global.mongo.save('users', member.brawl);
    }
    return {
        winner: winner,
        members: members
    }
}