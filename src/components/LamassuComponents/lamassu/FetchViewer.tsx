import { Skeleton, Box, Paper, Alert } from "@mui/material";
import { errorToString } from "ducks/services/api";
import React, { useEffect } from "react";

interface WrapperComponentProps<T> {
    fetcher: () => Promise<T>,
    renderer: (item: T) => React.ReactElement
    dynamic?: boolean
    errorPrefix?: string
}

type ComponentProps<T> = React.PropsWithChildren<WrapperComponentProps<T>>;

export const FetchViewer = <T extends object>(props: ComponentProps<T>) => {
    const [data, setData] = React.useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any | undefined>(undefined);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const resp = await props.fetcher();
            setData(resp);
        } catch (err: any) {
            setError(errorToString(err));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Box padding={"30px"}>
                <Skeleton variant="rectangular" width={"100%"} height={75} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            </Box>
        );
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
