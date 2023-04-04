import { TokenList } from 'token-list';
export const useToken = (chainId, addressOrSymbol) => {
    return new TokenList(chainId).token(addressOrSymbol);
};
