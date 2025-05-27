import { ListResponse, QueryParameters, } from "ducks/services/api-client";
import { AsymmetricKey } from "./models";

export const getAsymmetricKeys = async (params?: QueryParameters): Promise<ListResponse<AsymmetricKey>> => {
    return new Promise<ListResponse<AsymmetricKey>>((resolve, reject) => {
        let list = {
            list: [
                {
                    id: "key1",
                    name: "certificate my-ca",
                    algorithm: "RSA",
                    key: "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
                    sha256: "2abcb003e3d00934d7c246dd13729a974bab70bc2e336c4946a923b996677650",
                    tags: ["certificate-my-ca", "certificate", "my-ca", "ca"],
                    metadata: {},
                },
                {
                    id: "key2",
                    name: "certificate ocsp-responder",
                    algorithm: "ECDSA",
                    sha256: "bbf14704b2dc74861fbffbfb192a87b742f29340441c873f4bbb445dc0006ef9",
                    key: "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
                    tags: ["certificate-ocsp-responder", "certificate", "ocsp-responder"],
                    metadata: {}
                },
                {
                    id: "key3",
                    name: "regular key",
                    algorithm: "Ed25519",
                    sha256: "865485af9e6d1ae57c8aa022fa1d5da59ac9a6a85e6e1b5f8312f77f08c61c32",
                    key: "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
                    tags: ["tag5", "tag6"],
                    metadata: {}
                }
            ],
            next: ""
        }

        resolve(list);
    }) as Promise<ListResponse<AsymmetricKey>>;
};
