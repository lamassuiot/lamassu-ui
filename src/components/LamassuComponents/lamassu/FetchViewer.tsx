import { Skeleton, Box, Paper, Alert } from "@mui/material";
import { errorToString } from "ducks/services/api";
import React, { useEffect } from "react";

interface WrapperComponentProps<T> {
    fetcher: () => Promise<T>,
    renderer: (item: T) => React.ReactElement
    errorPrefix?: string
}

type ComponentProps<T> = React.PropsWithChildren<WrapperComponentProps<T>>;

export const FetchViewer = <T extends object, K = {}>(props: ComponentProps<T>) => {
    const [data, setData] = React.useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any | undefined>(undefined);

    useEffect(() => {
        const run = async () => {
            try {
                const resp = await props.fetcher();
                setData(resp);
            } catch (err: any) {
                setError(errorToString(err));
            }
            setIsLoading(false);
        };

        run();
    }, []);

    if (isLoading) {
        return <Skeleton variant="rectangular" width={"100%"} height={75} sx={{ borderRadius: "5px", marginBottom: "20px" }} />;
    } else if (data !== undefined) {
        return props.renderer(data);
    }

    return (
        <Box component={Paper}>
            <Alert severity="error">
                {
                    props.errorPrefix || "Could not fetch"
                }
                {
                    typeof error === "string" && error.length > 1 && (
                        <>: {error}</>
                    )
                }

            </Alert>
        </Box>
    );
};
