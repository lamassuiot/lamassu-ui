/* eslint-disable no-undef */
import * as pkijs from "pkijs";
import { X509, X509Subject, fromPEM, parseExtensions, parseRelativeDistinguishedNames, parseSANFromExtensions, parseSubjectPublicKeyInfo } from "./x509";
import moment from "moment";

export type X509Certificate = X509 & {
    serialNumber: string,
    issuer: X509Subject,
    notBefore: moment.Moment,
    notAfter: moment.Moment,
    extensions: Map<string, string>
}

export const parseCRT = async (rawCRT: string): Promise<X509Certificate> => {
    const raw = fromPEM(rawCRT);
    const crt = pkijs.Certificate.fromBER(raw);

    const x509: X509 = {
        publicKey: await parseSubjectPublicKeyInfo(crt.subjectPublicKeyInfo),
        subject: await parseRelativeDistinguishedNames(crt.subject),
        subjectAltName: []
    };

    let exts = new Map<string, string>();
    if (crt.extensions) {
        // console.log(crt.extensions.length);
        for (let i = 0; i < crt.extensions.length; i++) {
            const ext = crt.extensions[i];
        }
        const san = await parseSANFromExtensions(crt.extensions);
        x509.subjectAltName = san;

        exts = await parseExtensions(crt.extensions);
    }

    return {
        ...x509,
        extensions: exts,
        serialNumber: chunk(crt.serialNumber.toBigInt().toString(16), 2).join("-"),
        issuer: await parseRelativeDistinguishedNames(crt.issuer),
        notAfter: moment(crt.notAfter.value),
        notBefore: moment(crt.notBefore.value)
    };
};

function chunk (str: string, n: number) {
    const ret = [];
    let i;
    let len;

    for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
    }

    return ret;
};
