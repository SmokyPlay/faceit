import AbstractPermanentInteraction from "@/abstractions/AbstractPermanentInteraction";
import PermanentInteractionConfig from "@/types/PermanentInteractionConfig";
import {
    MessagePayload,
    MessageOptions,
    MessageEmbed,
    MessageActionRow,
    SelectMenuInteraction,
    GuildMember, MessageButton
} from "discord.js";
import SubscriptionConfig from "@/types/SubscriptionConfig";
import properties from '@/properties.json'
import PermanentInteractionExecutionResultConfig from "@/types/PermanentInteractionExecutionResultConfig";
import User from "@/types/database/User";
import CommandError from "@/utils/CommandError";
import Subscription from "@/types/database/Subscription";
import Premium from "@/types/Premium";

export default class PremiumInteraction extends AbstractPermanentInteraction implements PermanentInteractionConfig {
    public channelId = "999034221953830962"
    public messageId? = "999048646291112097"

    public message(): MessagePayload | MessageOptions {
        let premium: Premium = properties.premium;
        let role = global.client.guilds.cache.first().roles.cache.get("994986856481566780")
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setTitle("Премиум подписка")
            .setThumbnail("https://media.discordapp.net/attachments/992896807199834153/1003034166520188988/4562862.png")
            .setDescription(`**Роль:** ${role.toString()}\n\n**Цена:** ${premium.price}₽\n\n` +
            `Данная подписка включает в себя:\n\n` +
            `• Увеличенный призовой фонд\n` +
            `• Увеличенные шансы стать капитаном при создании игрового лобби\n` +
            `• Возможность пригласить 1 друга на сервер\n` +
            `• Дополнительный месяц игры\n` +
            `• Отдельный чат для более быстрой связи с Администрацией\n\n` +
            `Подписка Premium заканчивается в конце игрового сезона\n` +
            `Нажмите ${'`' + 'Купить' + '`'} для приобретения товара\n`)
        let button = new MessageButton()
            .setStyle("PRIMARY")
            .setCustomId("premium")
            .setLabel("Купить")
        let row = new MessageActionRow()
            .addComponents(button)
        return {embeds: [embed], components: [row]};
    }

    private async premium(interaction: SelectMenuInteraction): Promise<PermanentInteractionExecutionResultConfig> {
        let premium: Premium = properties.premium;
        let member = interaction.member as GuildMember;
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(member.roles.cache.get("994986856481566780")) return {
            reply: {
                embeds:
                    [CommandError.other(member, "Вы уже купили премиум подписку")],
                ephemeral: true
            }
        }
        if(user?.balance < premium.price) return {
            reply: {
                embeds:
                    [CommandError.other(member, "У вас недостаточно денег для покупки премиум подписки", "Недостаточно денег")],
                ephemeral: true
            }
        }
        user.balance -= premium.price;
        await global.mongo.save('users', user);
        let sub = await global.mongo.findOne<Subscription>('subscriptions', {id: member.id});
        sub.ends = new Date(sub.ends.getTime() + 2592000000)
        await global.mongo.save('subscriptions', sub)
        await member.roles.add("994986856481566780")
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Премиум подписка", iconURL: member.displayAvatarURL({dynamic: true})})
            .setDescription(`Вы купили премиум подписку\n` +
                `С вашего баланса списано ${premium.price}₽`)
        return {reply: {embeds: [embed], ephemeral: true}};
    }
}