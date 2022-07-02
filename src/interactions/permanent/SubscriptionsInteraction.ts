import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";
import PermanentInteractionConfig from "@/types/PermanentInteractionConfig";
import {
    MessagePayload,
    MessageOptions,
    MessageEmbed,
    MessageSelectMenu,
    MessageActionRow,
    SelectMenuInteraction,
    GuildMember
} from "discord.js";
import SubscriptionConfig from "@/types/SubscriptionConfig";
import properties from '@/properties.json'
import PermanentInteractionExecutionResultConfig from "@/types/PermanentInteractionExecutionResultConfig";
import User from "@/types/database/User";
import CommandError from "@/utils/CommandError";
import Subscription from "@/types/database/Subscription";

export default class SubscriptionsInteraction extends AbstractPermanentInteraction implements PermanentInteractionConfig {
    public channelId = "987309233391415316"
    public messageId? = "987349319709507594"

    public message(): MessagePayload | MessageOptions {
        let subscriptions: Array<SubscriptionConfig> = properties.subscriptions;
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setTitle("Подписки")
            .setDescription("Выберите подписку, которую хотите купить\n" +
                "Деньги за подписку спишутся __сразу__ в полном объеме, и их __нельзя будет вернуть__")
            subscriptions.forEach(subscription => {
                embed.addField(subscription.label, `Цена: ${subscription.price}₽` +
                    (subscription.months > 1 ? `\n(${subscription.price/subscription.months}₽ в месяц)` : ''), true)
            })
        let menu = new MessageSelectMenu()
            .setCustomId("subscription")
            .setPlaceholder("Выберите подписку")
            .addOptions(subscriptions)
        let row = new MessageActionRow()
            .addComponents(menu)
        return {embeds: [embed], components: [row]};
    }

    private async subscription(interaction: SelectMenuInteraction): Promise<PermanentInteractionExecutionResultConfig> {
        let subscriptions: Array<SubscriptionConfig> = properties.subscriptions;
        let member = interaction.member as GuildMember;
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        let subscription = subscriptions.find(sub => sub.value === interaction.values[0]);
        if(user?.balance < subscription.price) return {
            reply: {
                embeds:
                    [CommandError.other(member, "У вас недостаточно денег для покупки этой подписки", "Недостаточно денег")],
                ephemeral: true
            }
        }
        user.balance -= subscription.price;
        await global.mongo.save('users', user);
        let sub = await global.mongo.findOne<Subscription>('subscriptions', {id: member.id});
        if(sub) {
            sub.ends = new Date(sub.ends.getTime() + subscription.months * 2592000000)
            await global.mongo.save('subscriptions', sub)
        }
        else {
            let ends = new Date(Date.now() + subscription.months * 2592000000)
            await global.mongo.insert('subscriptions', {
                id: member.id,
                started: new Date(),
                ends: ends
            })
        }
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Подписка", iconURL: member.displayAvatarURL({dynamic: true})})
            .setDescription(`Вы купили подписку на ${subscription.label}` + '\n' +
            `С вашего баланса списано ${subscription.price}₽`)
        setTimeout(() => {
            member.roles.remove("782544002544959518");
        }, 5000)
        return {reply: {embeds: [embed], ephemeral: true}};
    }
}