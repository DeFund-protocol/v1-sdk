import { constants } from 'ethers';
import { ERC20ABI, NonfungiblePositionManagerAddress, SwapRouter02Address } from '../../constants';
import { useContract, useEncodeFuncData } from '../useContract';
import { Fund } from '../useFund';
const approveToken = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    try {
        const calldata = await approveTokenCalldata(chainId, signer, fundAddress, params);
        // if calldata is blank, no need approve
        if (!calldata)
            return [];
        return await new Fund(chainId, signer, fundAddress).executeOrder(params.token, calldata, constants.Zero, maker, refundGas, overrides);
    }
    catch (e) {
        throw e;
    }
};
const approveTokenCalldata = async (chainId, signer, fundAddress, params) => {
    try {
        // approve amount, default is constants.MaxUint256
        const amount = params.amount || constants.MaxUint256;
        const targetAddress = getTargetAddressFromOpType(chainId, params.opType, fundAddress);
        const needApprove = await tokenNeedApprove(signer, params.token, fundAddress, targetAddress, amount);
        if (needApprove)
            return '';
        return useEncodeFuncData(ERC20ABI, 'approve', [targetAddress, amount]);
    }
    catch (e) {
        throw e;
    }
};
const approveTokenMulticallCalldata = async (chainId, signer, maker, fundAddress, params, refundGas = false) => {
    const calldata = await approveTokenCalldata(chainId, signer, fundAddress, params);
    if (!calldata)
        return calldata;
    return new Fund(chainId, signer, fundAddress).executeOrderCallData(params.token, calldata, constants.Zero, maker, refundGas);
};
const tokenNeedApprove = async (signer, tokenAddress, fundAddress, spender, amount) => {
    const token = useContract(tokenAddress, ERC20ABI, signer);
    if (!token)
        throw new Error('Invalid token found');
    const allowance = await token.allowance(fundAddress, spender);
    return allowance.lt(amount);
};
/*
 * helper methods
 */
const getTargetAddressFromOpType = (chainId, opType, fundAddress) => {
    switch (opType) {
        case 'swap':
            return SwapRouter02Address[chainId];
        case 'lp':
            return NonfungiblePositionManagerAddress[chainId];
        case 'fund':
            return fundAddress;
        default:
            throw new Error(`Invalid opType for approve: ${opType}`);
    }
};
export { approveToken, approveTokenMulticallCalldata, tokenNeedApprove };
