import { useToken } from '../composables/useToken';
export const NativeETHAddress = '0x0000000000000000000000000000000000000002';
export const WethAddress = (chainId) => {
    return useToken(chainId, 'WETH').address;
};