/* eslint-disable no-undef */
import * as pkijs from "pkijs";
import * as asn1js from "asn1js";
import { X509, X509Subject, fromPEM, parseRelativeDistinguishedNames, parseSANFromExtensions, parseSubjectPublicKeyInfo, toPEM } from "./x509";

export const createPrivateKey = (keyType: "EC" | "RSA", keySize: number, hashAlg: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"): Promise<CryptoKeyPair> => {
    const crypto = pkijs.getCrypto(true);
    const keyGenAlgoithm = keyType === "RSA" ? "RSASSA-PKCS1-V1_5" : "ECDSA";
    const algParams = pkijs.getAlgorithmParameters(keyGenAlgoithm, "generateKey") as any;
    if ("hash" in algParams.algorithm) {
        algParams.algorithm.hash.name = hashAlg;
    }

    if (keyType === "RSA") {
        const rsaParams = algParams.algorithm as RsaHashedKeyGenParams;
        rsaParams.modulusLength = keySize;
        algParams.algorithm = rsaParams;
    } else {
        const ecdsaParams = algParams.algorithm as EcKeyGenParams;
        ecdsaParams.namedCurve = `P-${keySize}`; // can be "P-256", "P-384", or "P-521"
        algParams.algorithm = ecdsaParams;
    }

    return crypto.generateKey(algParams.algorithm, true, algParams.usages);
};

export const keyPairToPEM = async (keyPair: CryptoKeyPair, keyType: "EC" | "RSA"): Promise<{ privateKey: string }> => {
    const crypto = pkijs.getCrypto(true);
    const privBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
        privateKey: toPEM(privBuffer, `${keyType} PRIVATE KEY`)
    };
};

export const createCSR = async (keyPair: CryptoKeyPair, hashAlg: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", subject: X509Subject, san?: { dnss?: string[] }): Promise<string> => {
    const pkcs10 = new pkijs.CertificationRequest();
    await pkcs10.subjectPublicKeyInfo.importKey(keyPair.publicKey);

    pkcs10.version = 0;
    pkcs10.attributes = [];

    const subjectProps = {} as any;

    subjectProps["2.5.4.11"] = subject.ou;
    subjectProps["2.5.4.10"] = subject.o;
    subjectProps["2.5.4.6"] = subject.city;
    subjectProps["2.5.4.8"] = subject.state;
    subjectProps["2.5.4.6"] = subject.country;
    subjectProps["2.5.4.3"] = subject.cn;

    for (const key in subjectProps) {
        if (subjectProps[key]) {
            pkcs10.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
                type: key,
                value: new asn1js.PrintableString({ value: subjectProps[key] })
            }));
        }
    }

    const extensions: pkijs.Extension[] = [];
    let altNames: pkijs.GeneralNames | undefined;

    if (san && san.dnss && san.dnss.length > 0) {
        const dnsNames: pkijs.GeneralName[] = [];
        if (san.dnss) {
            san.dnss.forEach(dns => {
                const name = new pkijs.GeneralName({
                    type: 2,
                    value: dns
                });
                dnsNames.push(name);
            });
        }

        altNames = new pkijs.GeneralNames({
            names: [...dnsNames]
        });

        extensions.push(
            new pkijs.Extension({
                extnID: "2.5.29.17", // OID SAN
                critical: false,
                extnValue: altNames.toSchema().toBER(false)
            })
        );

        pkcs10.attributes.push(new pkijs.Attribute({
            type: "1.2.840.113549.1.9.14",
            values: [(new pkijs.Extensions({
                extensions: [
                    // new pkijs.Extension({
                    //     extnID: "2.5.29.14",
                    //     critical: false,
                    //     extnValue: (new asn1js.OctetString({ valueHex: subjectKeyIdentifier })).toBER(false)
                    // }),
                    ...extensions
                ]
            })).toSchema()]
        }));
    }

    await pkcs10.sign(keyPair.privateKey, hashAlg);

    const pkcs10Buffer = pkcs10.toSchema().toBER(false);
    return toPEM(pkcs10Buffer, "CERTIFICATE REQUEST");
};

export const validateCSR = (csr: pkijs.CertificationRequest): boolean => {
    // Check if the CSR has a version attribute
    if (!csr.version) {
        return false;
    }

    // Check if the CSR has a subject attribute
    if (!csr.subject) {
        return false;
    }

    // Check if the CSR has a public key
    if (!csr.subjectPublicKeyInfo) {
        return false;
    }

    // Check if the CSR has a signature
    if (!csr.signatureAlgorithm) {
        return false;
    }

    // Return true if the CSR format is valid
    return true;
};

export const parseCSR = async (rawCSR: string): Promise<X509> => {
    const pkcs10Raw = fromPEM(rawCSR);
    const csr = pkijs.CertificationRequest.fromBER(pkcs10Raw);

    if (validateCSR(csr)) {
        throw new Error("invalid CSR format");
    }

    const x509: X509 = {
        publicKey: await parseSubjectPublicKeyInfo(csr.subjectPublicKeyInfo),
        subject: await parseRelativeDistinguishedNames(csr.subject),
        subjectAltName: {
            dnss: []
        }
    };

    if (csr.attributes && csr.attributes.length > 0) {
        const seq = csr.attributes![0].values[0];
        const exts = pkijs.Extensions.fromBER(seq.toBER(false));
        const san = await parseSANFromExtensions(exts.extensions);
        x509.subjectAltName = san;
    }

    return x509;
};
