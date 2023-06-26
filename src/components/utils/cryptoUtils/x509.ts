/* eslint-disable no-undef */
import * as pkijs from "pkijs";
import * as pvtsutils from "pvtsutils";
import * as asn1js from "asn1js";

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
    keyType: "EC" | "RSA",
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
            keyInfo = { keyType: "EC", keySize: parseInt(ecPubKey.namedCurve.replace("P-", ""), 10) };
        } else {
            keyInfo = { keyType: "EC", keySize: -1 };
        }
    } else if (subjectPublicKey.algorithm.algorithmId === "1.2.840.113549.1.1.1") { // OID for RSA
        // keyInfo = { keyType: "EC", keySize: pkcs10.subjectPublicKeyInfo.parsedKey.valueHexView. }
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
