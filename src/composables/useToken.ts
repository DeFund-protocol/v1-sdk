import { TokenList } from '@defund-protocol/token-list';

export const useToken = (chainId: number, addressOrSymbol: string) => {
  return new TokenList(chainId).token(addressOrSymbol);
};