import React from "react";
import { Chip } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import { SubChannel, SubChannelType, Subscription } from "ducks/features/alerts/models";

export const renderChannelIcon = (channelType: SubChannelType) => {
    let icon = <></>;
    if (channelType === SubChannelType.Email) {
        icon = <EmailOutlinedIcon />;
    } else if (channelType === SubChannelType.MsTeams) {
        icon = <img src={process.env.PUBLIC_URL + "assets/msteams.png"} height="18px" />;
    } else if (channelType === SubChannelType.Webhook) {
        icon = <WebhookOutlinedIcon />;
    }
    return icon;
};

interface Props {
    channel: SubChannel
    onClick: (sub: SubChannel) => void
    onDelete?: (sub: SubChannel) => void
}

export const ChannelChip: React.FC<Props> = ({ channel, onClick, onDelete }) => {
    return (
        <Chip icon={renderChannelIcon(channel.type)} label={channel.type} onClick={() => onClick(channel)} {...onDelete && { onDelete: () => onDelete(channel) }} />
    );
};

interface SubProps {
    sub: Subscription
    onClick: (sub: Subscription) => void
    onDelete?: (sub: Subscription) => void
}

export const SubscriptionChip: React.FC<SubProps> = ({ sub, onClick, onDelete }) => {
    let label: string = sub.channel.type;
    switch (sub.channel.type) {
    case SubChannelType.Email:
        label = sub.channel.config.email;
        break;
    case SubChannelType.Webhook:
    case SubChannelType.MsTeams:
        label = sub.channel.name;
        break;

    default:
        break;
    }

    return (
        <Chip icon={renderChannelIcon(sub.channel.type)} label={label} onClick={(ev) => { ev.stopPropagation(); onClick(sub); }} {...onDelete && { onDelete: (ev) => { ev.stopPropagation(); onDelete(sub); } }} />
    );
};
