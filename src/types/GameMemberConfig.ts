import {GuildMember} from "discord.js";
import User from "@/types/database/User";

export default interface GameMemberConfig {
    discord: GuildMember
    brawl?: User
    captain: boolean
}