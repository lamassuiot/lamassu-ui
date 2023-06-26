/* eslint-disable no-undef */
import * as pkijs from "pkijs";
import { X509, X509Subject, fromPEM, parseRelativeDistinguishedNames, parseSANFromExtensions, parseSubjectPublicKeyInfo } from "./x509";
import moment from "moment";

export type X509Certificate = X509 & {
    serialNumber: string,
    issuer: X509Subject,
    notBefore: moment.Moment,
    notAfter: moment.Moment,
}

export const parseCRT = async (rawCRT: string): Promise<X509Certificate> => {
    const raw = fromPEM(rawCRT);
    const crt = pkijs.Certificate.fromBER(raw);

    const x509: X509 = {
        publicKey: await parseSubjectPublicKeyInfo(crt.subjectPublicKeyInfo),
        subject: await parseRelativeDistinguishedNames(crt.subject),
        subjectAltName: {
            dnss: []
        }
    };

    if (crt.extensions) {
        const san = await parseSANFromExtensions(crt.extensions);
        x509.subjectAltName = san;
    }

    return {
        ...x509,
        serialNumber: crt.serialNumber + "",
        issuer: await parseRelativeDistinguishedNames(crt.issuer),
        notAfter: moment(crt.notAfter.value),
        notBefore: moment(crt.notBefore.value)
    };
};
