import { FeeAmount } from '@uniswap/v3-sdk';
declare const isAddress: (value: any) => boolean;
declare const isEqualAddress: (address1: string, address2: string) => boolean;
declare const formatDetailData: (data: any) => any;
declare function encodePath(path: string[], fees: FeeAmount[]): string;
declare function mergedTokenBalances(chainId: number, tokenBalances: any[]): any[];
export { isAddress, isEqualAddress, formatDetailData, encodePath, mergedTokenBalances };
