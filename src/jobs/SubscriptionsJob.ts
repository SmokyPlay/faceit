import AbstractJob from "@/abstractions/AbstractJob";
import JobConfig from "@/types/JobConfig";
import Subscription from "../types/database/Subscription";

export default class SubscriptionsJob extends AbstractJob implements JobConfig {
    public interval = 3600000

    public async execute() {
        let users: Array<Subscription> = await global.mongo.db(process.env.DB_NAME).collection('subscriptions')
            .find({ends: {$lte: new Date()}}).toArray();
        for(let user of users) {
            await global.mongo.delete('subscriptions', {id: user.id});
            let member = await global.client.guilds.cache.first().members.fetch(user.id).catch(() => undefined);
            if(member) await member.roles.add("782544002544959518")
        }
    }
}