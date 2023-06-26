import * as asn1js from "asn1js";
import { getCrypto, getAlgorithmParameters, CertificationRequest, AttributeTypeAndValue, CryptoEngineAlgorithmParams, ICryptoEngine } from "pkijs/build";
import { arrayBufferToString, toBase64 } from "pvutils";
// https://github.com/PeculiarVentures/PKI.js/blob/31c10e9bb879cac59d710102adf4fd7bd61cd66c/src/CryptoEngine.js#L1300
const hashAlg = "SHA-256";
const signAlg = "ECDSA";

/**
 * @example
 * createPKCS10({ enrollmentID: 'user1', organizationUnit: 'Marketing', organization: 'Farmer Market', state: 'M', country: 'V' })
 *  .then(({csr, privateKey} => {...}))
 */
export async function createPKCS10 (keyAlg: "RSA" | "ECDSA", keySize: number, cn: string, subj: { organizationUnit?: string, organization?: string, city?: string, state?: string, country?: string }, san?: string) {
    const crypto = getWebCrypto();
    if (crypto === null) {
        throw Error("WebCrypto is null. Browser not supported");
    }

    let defKeyAlg: string = keyAlg;
    if (keyAlg === "RSA") {
        defKeyAlg = "RSASSA-PKCS1-v1_5";
    }

    const algorithm = getAlgorithm(defKeyAlg, hashAlg);
    if (keyAlg === "RSA") {
        // @ts-ignore
        algorithm.algorithm.modulusLength = keySize;
    } else {
        // @ts-ignore
        algorithm.algorithm.namedCurve = "P-" + keySize;
    }

    const keyPair = await generateKeyPair(crypto, algorithm);

    return {
        csr: `-----BEGIN CERTIFICATE REQUEST-----\n${formatPEM(
            toBase64(
                arrayBufferToString(
                    await createCSR(keyPair, hashAlg, cn, subj, san)
                )
            )
        )}\n-----END CERTIFICATE REQUEST-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----\n${toBase64(arrayBufferToString(await crypto.exportKey("pkcs8", keyPair.privateKey))).replace(/(.{64})/g, "$1\n")}\n-----END PRIVATE KEY-----`
    };
}

async function createCSR (keyPair: { publicKey: CryptoKey; privateKey: CryptoKey; }, hashAlg: string | undefined, cn: string, subj: { organizationUnit?: string, organization?: string, city?: string, state?: string, country?: string }, san?: string) {
    const pkcs10 = new CertificationRequest();
    pkcs10.version = 0;
    // list of OID reference: http://oidref.com/2.5.4
    if (subj.country) {
        pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
            type: "2.5.4.6", // countryName
            value: new asn1js.PrintableString({ value: subj.country })
        }));
    }
    if (subj.state) {
        pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
            type: "2.5.4.8", // stateOrProvinceName
            value: new asn1js.Utf8String({ value: subj.state })
        }));
    }
    if (subj.city) {
        pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
            type: "2.5.4.7", // locality
            value: new asn1js.Utf8String({ value: subj.city })
        }));
    }
    if (subj.organization) {
        pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
            type: "2.5.4.10", // organizationName
            value: new asn1js.Utf8String({ value: subj.organization })
        }));
    }
    if (subj.organizationUnit) {
        pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
            type: "2.5.4.11", // organizationUnitName
            value: new asn1js.Utf8String({ value: subj.organizationUnit })
        }));
    }
    if (san) {
        pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
            type: "2.5.29.17", // SAN
            value: new asn1js.Utf8String({ value: san })
        }));
    }
    pkcs10.subject.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.3", // commonName
        value: new asn1js.Utf8String({ value: cn })
    }));

    // add attributes to make CSR valid
    // Attributes must be "a0:00" if empty
    pkcs10.attributes = [];

    await pkcs10.subjectPublicKeyInfo.importKey(keyPair.publicKey);
    // signing final PKCS#10 request
    await pkcs10.sign(keyPair.privateKey, hashAlg);

    return pkcs10.toSchema().toBER(false);
}

// add line break every 64th character
function formatPEM (pemString: string) {
    return pemString.replace(/(.{64})/g, "$1\n");
}

function getWebCrypto () {
    const crypto = getCrypto();
    if (typeof crypto === "undefined") {
        throw Error("No WebCrypto extension found");
    };
    return crypto;
}

function getAlgorithm (signAlg: any, hashAlg: any) {
    // @ts-ignore
    const algorithm = getAlgorithmParameters(signAlg, "generatekey");
    // @ts-ignore
    if ("hash" in algorithm.algorithm) { algorithm.algorithm.hash.name = hashAlg; };
    return algorithm;
}

function generateKeyPair (crypto: ICryptoEngine, algorithm: CryptoEngineAlgorithmParams) {
    // @ts-ignore
    return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
}

/**
 * to learn more about asn1, ber & der, attributes & types used in pkcs#10
 * http://luca.ntop.org/Teaching/Appunti/asn1.html
 *
 * guides to SubtleCrypto (which PKIjs is built upon):
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */
