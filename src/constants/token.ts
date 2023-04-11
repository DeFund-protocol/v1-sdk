import { useToken } from '../composables/useToken';
import { AddressMap, SupportedChainId } from './contract';

export const NativeETHAddress = '0x0000000000000000000000000000000000000002';

export const WethAddress: AddressMap = {
  [SupportedChainId.MAINNET]: useToken(SupportedChainId.MAINNET, 'WETH')
    .address,
  [SupportedChainId.GOERLI]: useToken(SupportedChainId.GOERLI, 'WETH').address,
  [SupportedChainId.MATIC]: useToken(SupportedChainId.MATIC, 'WMATIC').address,
  [SupportedChainId.MUMBAI]: useToken(SupportedChainId.MUMBAI, 'WMATIC').address
};
