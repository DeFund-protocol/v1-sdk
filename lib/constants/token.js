import { useToken } from '../composables/useToken';
import { SupportedChainId } from './contract';
export const NativeETHAddress = '0x0000000000000000000000000000000000000002';
export const WethAddress = {
    [SupportedChainId.MAINNET]: useToken(SupportedChainId.MAINNET, 'WETH').address,
    [SupportedChainId.GOERLI]: useToken(SupportedChainId.GOERLI, 'WETH').address,
};
