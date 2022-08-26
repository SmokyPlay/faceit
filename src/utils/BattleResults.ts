import EndInteractionData from "@/types/InteractionsData/EndInteractionData";
import BattleConfig from "@/types/BrawlStars/BattleConfig";
import BattleResultsConfig from "@/types/BattleResultsConfig";
import properties from '@/properties.json';
import UserRankConfig from "@/types/UserRankConfig";
import GameMemberConfig from "@/types/GameMemberConfig";
import User from "@/types/database/User";
import {MessageEmbed} from "discord.js";

interface GetWinnerResults {
    winner: 'team1' | 'team2'
    team1: boolean
}

export default class BattleResults {
    public static GetWinner (data: EndInteractionData, logs: Array<BattleConfig>): GetWinnerResults {
        let victories = {
            team1: 0,
            team2: 0
        }
        let team1: boolean;
        for(let log of logs) {
            console.log(log.teams)
            if(log.teams[0].find(p => p.tag === data.team1[0].brawl.brawlTag.replace(/O/g, "0"))) team1 = true;
            else if(log.teams[0].find(p => p.tag === data.team2[0].brawl.brawlTag.replace(/O/g, "0"))) team1 = false;
            else return null;

            console.log(`Team1: ${team1}`);
            let valid = true;
            console.log(`Logs team1:`, log.teams[0])
            console.log(`Logs team2:`, log.teams[1])
            data[team1 ? "team1" : "team2"].forEach(member => {
                console.log(member.brawl)
                if(!log.teams[0].find(m => m.tag === member.brawl.brawlTag.replace(/O/g, "0"))) valid = false;
                console.log(`Includes: ${valid}`)
            })
            data[!team1 ? "team1" : "team2"].forEach(member => {
                console.log(member.brawl)
                if(!log.teams[1].find(m => m.tag === member.brawl.brawlTag.replace(/O/g, "0"))) valid = false;
                console.log(`Includes: ${valid}`)
            })
            console.log("Valid:", valid)
            if(!valid) return null;
            let winner = log.result === 'victory' ? 'team1' : 'team2';
            victories[winner]++;
        }
        console.log(victories)
        if(victories.team1 < 2 && victories.team2 < 2) return null;
        return {
            winner: victories.team1 > victories.team2 ? 'team1' : 'team2',
            team1: team1
        };
    }

    public static async BattleResults (data: EndInteractionData, winner: "team1" | "team2"): Promise<BattleResultsConfig> {
        let ranks: Array<UserRankConfig> = properties.ranks;
        let members: Array<GameMemberConfig & {eloChange: number}> = [];
        let fieldValue = '';
        for(let member of data.team1.concat(data.team2)) {
            let rank = ranks.find((r, i) => (member.brawl.elo >= r.elo) && (member.brawl.elo < ranks[i+1].elo));
            member.brawl = await global.mongo.findOne<User>('users', {id: member.discord.id});
            if(data[winner].includes(member)) {
                fieldValue += `${member.discord.toString()}  ${member.brawl.elo} ELO => ${member.brawl.elo + rank.victory}\n`
                member.brawl.elo += rank.victory;
                member.brawl.battles++;
                member.brawl.victories++;
                members.push(Object.assign(member, {eloChange: rank.victory}))
                if(member.brawl.elo >= ranks[rank.rank].elo) {
                    await member.discord.roles.remove(rank.role);
                    await member.discord.roles.add(ranks[rank.rank].role);
                }
            }
            else {
                fieldValue += `${member.discord.toString()}  ${member.brawl.elo} ELO => ${member.brawl.elo + rank.defeat}\n`
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
            members: members,
        }
    }
}