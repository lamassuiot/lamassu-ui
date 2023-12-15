export type Event = {
    event_types: string
    event: any
    seen_at: string
    counter: number
}
export type Subscription = {
    id: string,
    user_id: string,
    event_type: string,
    subscription_ts: string,
    conditions: SubscriptionCondition[],
    channel: SubChannel,
}

export enum SubscriptionConditionType {
    JsonSchema = "JSON-SCHEMA",
    JsonPath = "JSON-PATH",
}
export type SubscriptionCondition = {
    type: SubscriptionConditionType,
    condition: string,
}

export enum SubChannelType {
    Email = "EMAIL",
    Webhook = "WEBHOOK",
    MsTeams = "MSTEAMS"
}

export type SubChannel =
| {type: SubChannelType.Email, config: SubChannelEmailConfig }
| {type: SubChannelType.Webhook, name: string, config: SubChannelWebhookConfig }
| {type: SubChannelType.MsTeams, name: string, config: SubChannelMSTeamsConfig }

export type SubChannelEmailConfig = {
    email: string
}

export type SubChannelMSTeamsConfig = {
    webhook_url: string
}

export type SubChannelWebhookConfig = {
    webhook_url: string
    webhook_method: string
}
