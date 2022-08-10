import AbstractJob from "@/abstractions/AbstractJob";
import JobConfig from "@/types/JobConfig";
import Subscription from "../types/database/Subscription";
import {MessageEmbed} from "discord.js";

export default class SubscriptionsJob extends AbstractJob implements JobConfig {
    public interval = 3600000

    public async execute() {
        let users: Array<Subscription> = await global.mongo.db(process.env.DB_NAME).collection('subscriptions')
            .find({ends: {$lte: new Date()}}).toArray();
        for(let user of users) {
            await global.mongo.delete('subscriptions', {id: user.id});
            let member = await global.client.guilds.cache.first().members.fetch(user.id).catch(() => undefined);
            if(member) {
                await member.roles.add("782544002544959518")
                await member.roles.add("986961407222358076");
                let embed = new MessageEmbed()
                    .setColor('#007ef8')
                    .setAuthor({name: "Подписка закончилась", iconURL: member.user.avatarURL({dynamic: true})})
                    .setDescription("Ваша подписка на CIS FaceIT закончилась\n" +
                    "Чтобы продлить ее, перейдите в канал <#987309233391415316> и выберите нужную подписку")
                await member.send({embeds: [embed]});
            }
        }
    }
}