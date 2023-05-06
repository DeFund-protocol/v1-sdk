import { BigNumber } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
const isAddress = (value) => {
    try {
        return getAddress(value) !== null;
    }
    catch {
        return false;
    }
};
const isEqualAddress = (address1, address2) => {
    return (isAddress(address1) &&
        isAddress(address2) &&
        getAddress(address1) === getAddress(address2));
};
const formatDetailData = (data) => {
    if (!data)
        return;
    if (typeof data === 'string' || typeof data === 'number')
        return data;
    if (data instanceof BigNumber)
        return data.toString();
    if (data instanceof Array && data.length === 0)
        return data;
    const keys = Object.keys(data);
    if (keys.length === 0)
        return data;
    const params = {};
    for (let i = 0; i < Object.keys(data).length; i++) {
        if (!isNaN(parseInt(keys[i])))
            continue;
        switch (true) {
            case data[keys[i]] instanceof BigNumber:
                params[keys[i]] = data[keys[i]].toString();
                break;
            case data[keys[i]] instanceof Array:
                const isRealHash = Object.keys(data[keys[i]]).find((key) => {
                    return isNaN(parseInt(key));
                });
                if (isRealHash) {
                    params[keys[i]] = formatDetailData(data[keys[i]]);
                }
                else {
                    const arrayData = [];
                    for (let j = 0; j < data[keys[i]].length; j++) {
                        arrayData.push(formatDetailData(data[keys[i]][j]));
                    }
                    params[keys[i]] = arrayData;
                }
                break;
            default:
                params[keys[i]] = data[keys[i]];
        }
    }
    return params;
};
export { isAddress, isEqualAddress, formatDetailData };
