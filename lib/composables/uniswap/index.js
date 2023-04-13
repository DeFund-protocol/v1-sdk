import { NonfungiblePositionManagerAddress, SwapRouter02Address } from '../../constants';
import { executeSwap } from './useSwap';
import { executeLP } from './useLiquidityPool';
import { executeAssetsConvert, executeAssetsConvertWithSlippage } from './useAssetsConvert';
export class Uniswap {
    chainId;
    signer;
    swapRouter02Address;
    positionManagerAddress;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        this.swapRouter02Address = SwapRouter02Address[chainId];
        this.positionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    }
    async executeSwap(maker, fundAddress, params, refundGas, overrides) {
        params.expiration = this.executeExpiration(params);
        return await executeSwap(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
    }
    async executeLP(maker, fundAddress, params, refundGas, overrides) {
        params.expiration = this.executeExpiration(params);
        return await executeLP(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, refundGas, overrides) {
        params.expiration = this.executeExpiration(params);
        if (params.slippage) {
            return await executeAssetsConvertWithSlippage(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
        }
        else {
            return await executeAssetsConvert(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
        }
    }
    executeExpiration(params) {
        if (params.expiration)
            return params.expiration;
        return Math.round(new Date().getTime() / 1000 + 10 * 60);
    }
}
