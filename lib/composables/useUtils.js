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
export { isAddress, isEqualAddress };
