import { BasicColor } from "components/Label";

export type AsymmetricKey = {
    id: string,
    name: string,
    sha256: string,
    algorithm: string,
    key: string,
    tags: string[],
    metadata: { [key: string]: any },
}
