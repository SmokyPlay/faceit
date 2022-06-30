import EndInteractionDataConfig from "@/types/InteractionsData/EndInteractionDataConfig";
import BattleConfig from "@/types/BrawlStars/BattleConfig";
import BattleResultsConfig from "@/types/BattleResultsConfig";
import properties from '@/properties.json';
import UserRankConfig from "@/types/UserRankConfig";
import GameMemberConfig from "@/types/GameMemberConfig";

export default class BattleResults {
    public static async BattleResults (data: EndInteractionDataConfig, logs: Array<BattleConfig>): Promise<BattleResultsConfig> {
        let victories = {
            team1: 0,
            team2: 0
        }
        let mode = 0;
        let ranks: Array<UserRankConfig> = properties.ranks;
        for(let i = 2; i >= 0; i--) {
            let winner = await this.GetWinner(data, logs[i], mode);
            console.log(winner)
            if(!winner) {
                if(i === 2) mode--;
                else return null;
            }
            victories[winner]++;
            console.log(victories)
            mode++;
        }
        if(victories.team1 === victories.team2) return null;
        let winner: 'team1' | 'team2' = victories.team1 > victories.team2 ? 'team1' : 'team2';
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

    public static GetWinner (data: EndInteractionDataConfig, log: BattleConfig, mode: number): 'team1' | 'team2' {
        if(log.mode !== data.modes[mode].value) return null;
        let team1: boolean;
        if(log.teams[0].find(p => p.tag === data.team1[0].brawl.brawlTag)) team1 = true;
        else if(log.teams[0].find(p => p.tag === data.team2[0].brawl.brawlTag)) team1 = false;
        else return null;
        let valid: boolean;
        data[team1 ? "team1" : "team2"].forEach(member => {
            console.log(log.teams[0].find(m => m.tag === member.brawl.brawlTag))
            valid = !!log.teams[0].find(m => m.tag === member.brawl.brawlTag);
        })
        data[!team1 ? "team1" : "team2"].forEach(member => {
            console.log(log.teams[0].find(m => m.tag === member.brawl.brawlTag))
            valid = !!log.teams[1].find(m => m.tag === member.brawl.brawlTag);
        })
        console.log(valid)
        if(!valid) return null;
        return log.result === 'victory' ? 'team1' : 'team2';
    }
}