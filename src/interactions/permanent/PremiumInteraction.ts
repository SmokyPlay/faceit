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
    public messageId? = "987349319709507594"

    public message(): MessagePayload | MessageOptions {
        let premium: Premium = properties.premium;
        let role = global.client.guilds.cache.first().roles.cache.get("994986856481566780")
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setTitle("Премиум подписка")
            .setDescription(`**Цена:** ${premium.price}₽\n**Роль:** ${role.toString()}\n` +
            `С этой ролью ваш шанс стать капитаном в игре повышается на 60%!\n` +
            `Премиум подписка заканчивается в конце сезона\n` +
            `Нажмите ${'`' + 'Купить' + '`'} чтобы купить премиум подписку\n` +
            `Деньги спишутся сразу и в полном объеме`)
        let button = new MessageButton()
            .setStyle("PRIMARY")
            .setCustomId("premium")
            .setLabel("Купить")
        let row = new MessageActionRow()
            .addComponents(button)
        return {embeds: [embed], components: [row]};
    }

    private async subscription(interaction: SelectMenuInteraction): Promise<PermanentInteractionExecutionResultConfig> {
        let premium: Premium = properties.premium;
        let member = interaction.member as GuildMember;
        let user = await global.mongo.findOne<User>('users', {id: member.id});
        if(user?.balance < premium.price) return {
            reply: {
                embeds:
                    [CommandError.other(member, "У вас недостаточно денег для покупки премиум подписки", "Недостаточно денег")],
                ephemeral: true
            }
        }
        user.balance -= premium.price;
        await global.mongo.save('users', user);
        await member.roles.add("994986856481566780")
        let embed = new MessageEmbed()
            .setColor('#007ef8')
            .setAuthor({name: "Премиум подписка", iconURL: member.displayAvatarURL({dynamic: true})})
            .setDescription(`Вы купили премиум подписку\n` +
                `С вашего баланса списано ${premium.price}₽`)
        return {reply: {embeds: [embed], ephemeral: true}};
    }
}