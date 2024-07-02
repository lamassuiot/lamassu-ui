/* eslint-disable no-undef */
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import * as pvtsutils from "pvtsutils";

export type X509Subject = {
    cn?: string,
    ou?: string,
    o?: string,
    city?: string,
    state?: string,
    country?: string
}

export type X509SubjectAlternativeName = {
    dnss: string[],
}

export type X509PublicKeyProps = {
    keyType: "ECDSA" | "RSA",
    keySize: number,
}

export type X509 = {
    subject: X509Subject,
    subjectAltName: X509SubjectAlternativeName,
    publicKey: X509PublicKeyProps,
}

export const parseSubjectPublicKeyInfo = async (subjectPublicKey: pkijs.PublicKeyInfo): Promise<X509PublicKeyProps> => {
    let keyInfo: X509PublicKeyProps = { keyType: "RSA", keySize: -1 };

    if (subjectPublicKey.algorithm.algorithmId === "1.2.840.10045.2.1") { // OID for Elliptic curve public key cryptography
        const ecPubKey = subjectPublicKey.parsedKey;
        if (ecPubKey instanceof pkijs.ECPublicKey) {
            keyInfo = { keyType: "ECDSA", keySize: parseInt(ecPubKey.namedCurve.replace("P-", ""), 10) };
        } else {
            keyInfo = { keyType: "ECDSA", keySize: -1 };
        }
    } else if (subjectPublicKey.algorithm.algorithmId === "1.2.840.113549.1.1.1") { // OID for RSA
        // keyInfo = { keyType: "ECDSA", keySize: pkcs10.subjectPublicKeyInfo.parsedKey.valueHexView. }
        const rsaPubKey = subjectPublicKey.parsedKey;
        if (rsaPubKey instanceof pkijs.RSAPublicKey) {
            keyInfo = { keyType: "RSA", keySize: rsaPubKey.modulus.valueBlock.valueHexView.byteLength * 8 };
        } else {
            keyInfo = { keyType: "RSA", keySize: -1 };
        }
    }

    return keyInfo;
};

export const parseRelativeDistinguishedNames = async (rdn: pkijs.RelativeDistinguishedNames): Promise<X509Subject> => {
    const findSubjectProp = (oid: string): string | undefined => {
        const oidTypeVal = rdn.typesAndValues.find(typeVal => typeVal.type === oid);
        if (!oidTypeVal) {
            return undefined;
        }

        return oidTypeVal.value.valueBlock.value;
    };

    const subject: X509Subject = {
        cn: findSubjectProp("2.5.4.3"),
        country: findSubjectProp("2.5.4.6"),
        city: findSubjectProp("2.5.4.7"),
        state: findSubjectProp("2.5.4.8"),
        o: findSubjectProp("2.5.4.10"),
        ou: findSubjectProp("2.5.4.11")
    };

    return subject;
};

export const parseSANFromExtensions = async (extensions: pkijs.Extension[]): Promise<X509SubjectAlternativeName> => {
    const getExtensionsForSANFromExtensions = (exts: pkijs.Extension[]) => {
        for (let i = 0; i < exts.length; i++) {
            const ext = exts[i];
            if (ext.extnID === "2.5.29.17") { // OID SAN
                const octetString = asn1js.fromBER(ext.extnValue.toBER(false)).result;
                // @ts-ignore
                return pkijs.GeneralNames.fromBER(octetString.getValue());
            }
        }

        return undefined;
    };

    const sanDNSs: string[] = [];

    const san = getExtensionsForSANFromExtensions(extensions);
    if (san !== undefined) {
        san.names.forEach(element => {
            sanDNSs.push(element.value);
        });
    }

    return { dnss: sanDNSs };
};

export const parseExtensions = async (extensions: pkijs.Extension[]): Promise<Map<string, string>> => {
    const extensionMap = new Map<string, string>();
    for (let i = 0; i < extensions.length; i++) {
        const ext = extensions[i];
        const octetString = asn1js.fromBER(ext.extnValue.toBER(false)).result;
        switch (ext.extnID) {
        case "2.5.29.17": { // OID SAN
            // @ts-ignore
            const san = pkijs.GeneralNames.fromBER(octetString.getValue());
            extensionMap.set("Subject Alternative Name", san.names.join(", "));
            break;
        }
        case "2.5.29.37": { // OID keyUsage
            // @ts-ignore
            const res = pkijs.ExtKeyUsage.fromBER(octetString.getValue());
            const resolver = (oid: string): string => {
                switch (oid) {
                case "1.3.6.1.5.5.7.3.1":
                    return "Server Auth";
                case "1.3.6.1.5.5.7.3.2":
                    return "Client Auth";
                default:
                    return oid;
                }
            };
            extensionMap.set("Extended Key Usage", res.keyPurposes.map(oid => resolver(oid)).join(", "));
            break;
        }
        case "2.5.29.19": { // OID basicConstraints
            // @ts-ignore
            const dec = pkijs.BasicConstraints.fromBER(octetString.getValue());
            extensionMap.set("Basic Constraints", `IsCA: ${dec.cA}`);
            break;
        }
        default:
            extensionMap.set(`Extension OID: ${ext.extnID}`, "<present but currently not decoded>");
            break;
        }
    }

    return extensionMap;
};

export function toPEM (buffer: BufferSource, tag: string): string {
    return [
        `-----BEGIN ${tag}-----`,
        formatPEM(pvtsutils.Convert.ToBase64(buffer)),
        `-----END ${tag}-----`,
        ""
    ].join("\n");
}

export function fromPEM (pem: string): ArrayBuffer {
    const base64 = pem
        .replace(/-{5}(BEGIN|END) .*-{5}/gm, "")
        .replace(/\s/gm, "");
    return pvtsutils.Convert.FromBase64(base64);
}

export function formatPEM (pemString: string): string {
    const PEM_STRING_LENGTH = pemString.length; const LINE_LENGTH = 64;
    const wrapNeeded = PEM_STRING_LENGTH > LINE_LENGTH;

    if (wrapNeeded) {
        let formattedString = ""; let wrapIndex = 0;

        for (let i = LINE_LENGTH; i < PEM_STRING_LENGTH; i += LINE_LENGTH) {
            formattedString += pemString.substring(wrapIndex, i) + "\r\n";
            wrapIndex = i;
        }

        formattedString += pemString.substring(wrapIndex, PEM_STRING_LENGTH);
        return formattedString;
    }

    return pemString;
}

export function parseCertificateBundle (pem: string): string[] {
    function decodePEM (pem: string, tag = "[A-Z0-9 ]+"): ArrayBuffer[] {
        const pattern = new RegExp(`-{5}BEGIN ${tag}-{5}([a-zA-Z0-9=+\\/\\n\\r]+)-{5}END ${tag}-{5}`, "g");

        const res: ArrayBuffer[] = [];
        let matches: RegExpExecArray | null = null;
        // eslint-disable-next-line no-cond-assign
        while (matches = pattern.exec(pem)) {
            const base64 = matches[1]
                .replace(/\r/g, "")
                .replace(/\n/g, "");
            res.push(pvtsutils.Convert.FromBase64(base64));
        }

        return res;
    }
    const buffers: ArrayBuffer[] = [];

    if (/----BEGIN CERTIFICATE-----/.test(pem)) {
        buffers.push(...decodePEM(pem, "CERTIFICATE"));
    }

    const res: string[] = [];
    for (const item of buffers) {
        res.push(toPEM(item, "CERTIFICATE"));
    }

    return res;
}
