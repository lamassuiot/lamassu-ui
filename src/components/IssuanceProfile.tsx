import { ExtendedKeyUsage, Profile, KeyUsage } from "ducks/features/cas/models";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { ExpirationInput } from "./forms/Expiration";
import { GenericSelector } from "./GenericSelector";
import Grid from "@mui/material/Unstable_Grid2";
import { Typography } from "@mui/material";

export type Props = {
    onChange: (profile: Profile) => void
}

export const IssuanceProfile: React.FC<Props> = (props: Props) => {
    const [keyUsage, setKeyUsage] = useState<KeyUsage[]>([]);
    const [extendedKeyUsage, setExtendedKeyUsage] = useState<ExtendedKeyUsage[]>([ExtendedKeyUsage.ClientAuth, ExtendedKeyUsage.ServerAuth]);
    const [certValidity, setCertValidity] = useState<{
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: string
    }>({ type: "duration", duration: "1y", date: moment() });

    useEffect(() => {
        const profile: Profile = {
            extended_key_usage: extendedKeyUsage,
            key_usage: keyUsage,
            sign_as_ca: false,
            honor_extensions: true,
            honor_subject: true,
            validity: {
                type: "Duration",
                duration: "1y"
            }
        };

        if (certValidity.type === "duration") {
            profile.validity = {
                type: "Duration",
                duration: certValidity.duration
            };
        } else {
            profile.validity = {
                type: "Time",
                time: certValidity.date.format()
            };
        }

        props.onChange(profile);
    }
    , [keyUsage, extendedKeyUsage, certValidity]);

    return (
        <Grid container spacing={1}>
            <Grid xs={12} container spacing={2} padding={2}>
                <Grid xs={12}>
                    <Typography variant="h4">Certificate Properties</Typography>
                </Grid>
                <Grid xs={6} container>
                    <Grid xs={12}>
                        <GenericSelector
                            fetcher={async (query, controller): Promise<KeyUsage[]> => {
                                return new Promise<KeyUsage[]>(resolve => {
                                    const values = Object.values(KeyUsage);
                                    resolve(values);
                                });
                            }}
                            label={"Key Usage"}
                            multiple={true}
                            optionID={(item) => item}
                            optionLabel={(item) => item}
                            value={keyUsage}
                            onSelect={(item) => {
                                if (item && Array.isArray(item)) {
                                    setKeyUsage(item);
                                }
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid xs={6} container>
                    <Grid xs={12}>
                        <GenericSelector
                            fetcher={async (query, controller) => {
                                return new Promise<ExtendedKeyUsage[]>(resolve => {
                                    resolve(Object.values(ExtendedKeyUsage));
                                });
                            }}
                            label={"Extended Key Usage"}
                            multiple={true}
                            optionID={(item) => item}
                            optionLabel={(item) => item}
                            value={extendedKeyUsage}
                            onSelect={(item) => {
                                if (item && Array.isArray(item)) {
                                    setExtendedKeyUsage(item);
                                }
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid xs={12} md={6} container spacing={1} flexDirection={"column"}>
                    <Grid xs={12}>
                        <Typography variant="h4">Certificate Expiration</Typography>
                    </Grid>
                    <Grid>
                        <ExpirationInput onChange={setCertValidity} value={certValidity} enableInfiniteDate={false} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};
