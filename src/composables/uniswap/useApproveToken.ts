import { BigNumber, Overrides, Signer, constants } from 'ethers';
import {
  ERC20ABI,
  NonfungiblePositionManagerAddress,
  SwapRouter02Address
} from '../../constants';
import { useContract, useEncodeFuncData } from '../useContract';
import { Fund } from '../useFund';

export type ApproveParams = {
  opType: string;
  token: string;
  amount?: BigNumber;
};

const approveToken = async (
  chainId: number,
  signer: Signer,
  maker: string,
  fundAddress: string,
  params: ApproveParams,
  refundGas?: boolean,
  overrides?: Overrides
) => {
  try {
    const calldata = await approveTokenCalldata(
      chainId,
      signer,
      fundAddress,
      params
    );

    // if calldata is blank, no need approve
    if (!calldata) return [];

    return await new Fund(chainId, signer, fundAddress).executeOrder(
      params.token,
      calldata,
      constants.Zero,
      maker,
      refundGas,
      overrides
    );
  } catch (e) {
    throw e;
  }
};

const approveTokenCalldata = async (
  chainId: number,
  signer: Signer,
  fundAddress: string,
  params: ApproveParams
): Promise<string> => {
  try {
    // approve amount, default is constants.MaxUint256
    const amount = params.amount || constants.MaxUint256;
    const targetAddress = getTargetAddressFromOpType(chainId, params.opType);

    const needApprove = await tokenNeedApprove(
      signer,
      params.token,
      fundAddress,
      targetAddress,
      amount
    );

    if (needApprove) return '';
    return useEncodeFuncData(ERC20ABI, 'approve', [targetAddress, amount]);
  } catch (e) {
    throw e;
  }
};

const approveTokenMulticallCalldata = async (
  chainId: number,
  signer: Signer,
  maker: string,
  fundAddress: string,
  params: ApproveParams,
  refundGas = false
) => {
  const calldata = await approveTokenCalldata(
    chainId,
    signer,
    fundAddress,
    params
  );
  if (!calldata) return calldata;

  return new Fund(chainId, signer, fundAddress).executeOrderCallData(
    params.token,
    calldata,
    constants.Zero,
    maker,
    refundGas
  );
};

const tokenNeedApprove = async (
  signer: Signer,
  tokenAddress: string,
  fundAddress: string,
  spender: string,
  amount: BigNumber
) => {
  const token = useContract(tokenAddress, ERC20ABI, signer);
  if (!token) throw new Error('Invalid token found');

  const allowance: BigNumber = await token.allowance(fundAddress, spender);

  return allowance.lt(amount);
};

/*
 * helper methods
 */
const getTargetAddressFromOpType = (
  chainId: number,
  opType: string
): string => {
  switch (opType) {
    case 'swap':
      return SwapRouter02Address[chainId];
    case 'lp':
      return NonfungiblePositionManagerAddress[chainId];
    default:
      throw new Error(`Invalid opType for approve: ${opType}`);
  }
};

export { approveToken, approveTokenMulticallCalldata, tokenNeedApprove };
