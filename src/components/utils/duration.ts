const unitConverterToSeconds = {
    s: 1,
    m: 60,
    h: 3600,
    d: 3600 * 24,
    w: 3600 * 24 * 7,
    y: 3600 * 24 * 365
};

const validDurationRegex = (test: string) => {
    const validator = /\d+[ywdhms]{1}/;
    const res = test.match(validator);
    if (res && res[0] === test) {
        return true;
    }
    return false;
};
const durationValueUnitSplitRegex = /\d+|\D+/g;

export {
    unitConverterToSeconds,
    durationValueUnitSplitRegex,
    validDurationRegex
};
