import { Alert, Box, Paper, Skeleton } from "@mui/material";
import { errorToString } from "../ducks/services/api-client";
import React, { ReactElement, Ref, useEffect, useImperativeHandle } from "react";

interface WrapperComponentProps<T> {
    fetcher: (controller: AbortController) => Promise<T>,
    renderer: (item: T) => React.ReactElement
    errorPrefix?: string
    ref?: Ref<any>
    dynamic?: boolean
}

export type FetchHandle = {
    refresh: () => void,
}

type ComponentProps<T> = React.PropsWithChildren<WrapperComponentProps<T>>;

const Fetcher = <T extends object>(props: ComponentProps<T>, ref: Ref<FetchHandle>) => {
    const [data, setData] = React.useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any | undefined>(undefined);

    const fetchData = async (controller: AbortController) => {
        setIsLoading(true);
        try {
            const resp = await props.fetcher(controller);
            setData(resp);
        } catch (err: any) {
            setError(errorToString(err));
        }
        setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
        refresh () {
            fetchData(new AbortController());
        }
    }));

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller);
        return () => controller.abort();
    }, []);

    if (isLoading) {
        return (
            <Skeleton variant="rectangular" width={"100%"} height={20} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
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

export const FetchViewer = React.forwardRef(Fetcher) as <T extends object>(props: ComponentProps<T> & { ref?: Ref<FetchHandle> }) => ReactElement;
