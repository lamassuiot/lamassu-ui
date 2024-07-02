import { CertificateAuthority } from "ducks/features/cas/models";
import { FetchHandle, FetchViewer } from "components/FetchViewer";
import { ListResponse, QueryParameters } from "ducks/services/api-client";
import React, { ReactElement, Ref, useEffect } from "react";
import apicalls from "ducks/apicalls";

type Props = {
    renderer: (item: ListResponse<CertificateAuthority>) => React.ReactElement
    params?:QueryParameters | undefined
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    useEffect(() => {
        if (ref) {
            // @ts-ignore
            ref.current?.refresh();
        }
    }, [props.params]);

    return (
        <FetchViewer
            fetcher={(controller) => {
                return apicalls.cas.getCAs(props.params);
            }}
            renderer={(items: ListResponse<CertificateAuthority>) => props.renderer(items)}
            ref={ref}
        />
    );
};

export const CAListFetchViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
