import React, { useEffect } from "react";
import { Box, Skeleton, useTheme, Paper } from "@mui/material";
import { Alert } from "@mui/lab";
import { CertificateAuthority } from "ducks/features/cas/models";
import * as caApicalls from "ducks/features/cas/apicalls";
import CAViewer from "./CAViewer";

interface Props {
    caName: string,
}

const CAFetchViewer: React.FC<Props> = ({ caName }) => {
    const theme = useTheme();
    const [ca, setCA] = React.useState<CertificateAuthority | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any | undefined>(undefined);

    useEffect(() => {
        const run = async () => {
            try {
                if (caName === "") {
                    throw new Error("empty CA name");
                }
                const respRaw = await caApicalls.getCA(caName);
                setCA(new CertificateAuthority(respRaw));
            } catch (err: any) {
                setError(err);
            }
            setIsLoading(false);
        };

        run();
    }, []);

    console.log(ca);

    if (isLoading) {
        return <Skeleton variant="rectangular" width={"100%"} height={75} sx={{ borderRadius: "5px", marginBottom: "20px" }} />;
    } else if (ca !== undefined) {
        return <CAViewer caData={ca} />;
    }

    return (
        <Box component={Paper}>
            <Alert severity="error">
                Could not fetch &quot;{caName}&quot; CA. Something went wrong
                {
                    typeof error === "string" && (
                        <>:{error}</>
                    )
                }

            </Alert>
        </Box>
    );
};

export default CAFetchViewer;
