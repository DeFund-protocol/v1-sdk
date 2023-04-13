import { CurrencyAmount, Ether, Percent, Price, Token } from '@uniswap/sdk-core';
import { FACTORY_ADDRESS, FeeAmount, NonfungiblePositionManager, Pool, Position, TICK_SPACINGS, TickMath, computePoolAddress, nearestUsableTick, priceToClosestTick } from '@uniswap/v3-sdk';
import { BigNumber, constants } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { fraction } from 'mathjs';
import { IUniswapV3PoolABI, NonfungiblePositionManagerABI, NonfungiblePositionManagerAddress } from '../../constants';
import { WethAddress } from '../../constants/token';
import { useContract } from '../useContract';
import { Fund } from '../useFund';
import { useToken } from '../useToken';
import { isEqualAddress } from '../useUtils';
import { approveTokenMulticallCalldata } from './useApproveToken';
import { swapMulticallCalldata } from './useSwap';
const getPoolAddress = (chainId, token0, token1, fee) => {
    const tokenA = new Token(chainId, token0.address, token0.decimals);
    const tokenB = new Token(chainId, token1.address, token1.decimals);
    return computePoolAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA,
        tokenB,
        fee
    });
};
const addLiquidity = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const executeParams = await addLiquidityMulticallDatacall(chainId, signer, maker, fundAddress, params, refundGas);
    return await new Fund(chainId, signer, fundAddress).executeMulticall(executeParams, overrides);
};
const addLiquidityCalldata = async (chainId, signer, params, fundAddress) => {
    const token0 = useToken(chainId, params.tokenA);
    const token1 = useToken(chainId, params.tokenB);
    const tokenA = new Token(chainId, token0.address, token0.decimals);
    const tokenB = new Token(chainId, token1.address, token1.decimals);
    if (!(tokenA && tokenB))
        throw new Error('Invalid token');
    const amountA = BigNumber.from(params.amountA);
    const amountB = BigNumber.from(params.amountB);
    const fee = params.fee;
    if (!Object.values(FeeAmount).includes(fee))
        throw new Error('Invalid fee');
    const poolAddress = getPoolAddress(chainId, tokenA, tokenB, fee);
    if (!poolAddress)
        throw new Error('Invalid pool address');
    const poolContract = useContract(poolAddress, IUniswapV3PoolABI, signer);
    const slot0 = await poolContract.slot0();
    const currentTick = slot0.tick;
    const currentLiquidity = await poolContract.liquidity();
    let tickLower = params.lowerTick;
    if (!tickLower) {
        const lowerPriceInFraction = fraction(params.lowerPrice);
        tickLower = nearestUsableTick(priceToClosestTick(new Price(tokenA, tokenB, parseUnits(lowerPriceInFraction.d.toString(), token0.decimals).toString(), parseUnits(lowerPriceInFraction.n.toString(), token1.decimals).toString())), TICK_SPACINGS[fee]);
    }
    let tickUpper = params.upperTick;
    if (!tickUpper) {
        const upperPriceInFraction = fraction(params.upperPrice);
        tickUpper = nearestUsableTick(priceToClosestTick(new Price(tokenA, tokenB, parseUnits(upperPriceInFraction.d.toString(), token0.decimals).toString(), parseUnits(upperPriceInFraction.n.toString(), token1.decimals).toString())), TICK_SPACINGS[fee]);
    }
    const currentSqrtRatioX96 = TickMath.getSqrtRatioAtTick(currentTick);
    const pool = new Pool(tokenA, tokenB, fee, currentSqrtRatioX96, currentLiquidity, currentTick);
    const positionToMint = Position.fromAmounts({
        pool,
        tickLower,
        tickUpper,
        amount0: amountA.toString(),
        amount1: amountB.toString(),
        useFullPrecision: true
    });
    const addLiquidityOptions = {
        tokenId: params.tokenId,
        slippageTolerance: new Percent(1, 100),
        deadline: params.expiration
    };
    if (params.useNative) {
        addLiquidityOptions.useNative = Ether.onChain(chainId);
    }
    // if (!params.tokenId) {
    //   addLiquidityOptions.recipient = fundAddress;
    // }
    const { calldata } = NonfungiblePositionManager.addCallParameters(positionToMint, addLiquidityOptions);
    return calldata;
};
const addLiquidityMulticallDatacall = async (chainId, signer, maker, fundAddress, params, refundGas) => {
    const wethAddress = WethAddress[chainId];
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const calldatas = [];
    const approveTokenAparams = {
        opType: 'lp',
        token: params.tokenA
    };
    const approveTokenACalldata = approveTokenMulticallCalldata(chainId, signer, maker, fundAddress, approveTokenAparams, refundGas);
    calldatas.push(approveTokenACalldata);
    const approveTokenBParams = {
        opType: 'lp',
        token: params.tokenB
    };
    const approveTokenBCalldata = approveTokenMulticallCalldata(chainId, signer, maker, fundAddress, approveTokenBParams, refundGas);
    calldatas.push(approveTokenBCalldata);
    const calldata = await addLiquidityCalldata(chainId, signer, params, fundAddress);
    const ethAmount = calcEthAmount(params, wethAddress);
    const addCalldata = new Fund(chainId, signer, fundAddress).executeOrderCallData(nonfungiblePositionManagerAddress, calldata, ethAmount, maker, refundGas);
    calldatas.push(addCalldata);
    return calldatas;
};
const removeLiquidity = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const calldata = await removeLiquidityCalldata(chainId, signer, params, fundAddress);
    return await new Fund(chainId, signer, fundAddress).executeOrder(nonfungiblePositionManagerAddress, calldata, constants.Zero, maker, refundGas, overrides);
};
const removeLiquidityMulticallCalldata = async (chainId, signer, maker, fundAddress, params, refundGas) => {
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const calldata = await removeLiquidityCalldata(chainId, signer, params, fundAddress);
    return new Fund(chainId, signer, fundAddress).executeOrderCallData(nonfungiblePositionManagerAddress, calldata, constants.Zero, maker, refundGas);
};
const removeLiquidityCalldata = async (chainId, signer, params, fundAddress) => {
    const token0 = useToken(chainId, params.tokenA);
    const token1 = useToken(chainId, params.tokenB);
    const tokenA = new Token(chainId, token0.address, token0.decimals);
    const tokenB = new Token(chainId, token1.address, token1.decimals);
    if (!(tokenA && tokenB))
        throw new Error('Invalid token');
    const wethAddress = WethAddress[chainId];
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const fee = Number(params.fee);
    if (!Object.values(FeeAmount).includes(fee))
        throw new Error('Invalid fee');
    const poolAddress = getPoolAddress(chainId, tokenA, tokenB, fee);
    if (!poolAddress)
        throw new Error('Invalid pool address');
    const poolContract = useContract(poolAddress, IUniswapV3PoolABI, signer);
    const slot0 = await poolContract.slot0();
    const currentTick = slot0.tick;
    const currentLiquidity = await poolContract.liquidity();
    const currentSqrtRatioX96 = TickMath.getSqrtRatioAtTick(currentTick);
    const positionData = await useContract(nonfungiblePositionManagerAddress, NonfungiblePositionManagerABI, signer).positions(BigNumber.from(params.tokenId));
    const pool = new Pool(tokenA, tokenB, fee, currentSqrtRatioX96, currentLiquidity, currentTick);
    const position = new Position({
        pool,
        tickLower: positionData.tickLower,
        tickUpper: positionData.tickUpper,
        liquidity: positionData.liquidity
    });
    const { calldata } = NonfungiblePositionManager.removeCallParameters(position, {
        tokenId: params.tokenId,
        liquidityPercentage: new Percent(params.percent || 100, 100),
        slippageTolerance: new Percent(1, 100),
        deadline: Math.round(Date.now() / 1000) + 1800,
        collectOptions: {
            expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenA, wethAddress)
                ? Ether.onChain(chainId)
                : tokenA, 0),
            expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenB, wethAddress)
                ? Ether.onChain(chainId)
                : tokenB, 0),
            recipient: fundAddress
        }
    });
    return calldata;
};
const collectFee = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const calldata = await collectFeeCalldata(chainId, params, fundAddress);
    return await new Fund(chainId, signer, fundAddress).executeOrder(nonfungiblePositionManagerAddress, calldata, constants.Zero, maker, refundGas, overrides);
};
const collectFeeCalldata = async (chainId, params, fundAddress) => {
    const token0 = useToken(chainId, params.tokenA);
    const token1 = useToken(chainId, params.tokenB);
    const tokenA = new Token(chainId, token0.address, token0.decimals);
    const tokenB = new Token(chainId, token1.address, token1.decimals);
    if (!(tokenA && tokenB))
        throw new Error('Invalid token');
    const wethAddress = WethAddress[chainId];
    const fee = Number(params.fee);
    if (!Object.values(FeeAmount).includes(fee))
        throw new Error('Invalid fee');
    const poolAddress = getPoolAddress(chainId, tokenA, tokenB, fee);
    if (!poolAddress)
        throw new Error('Invalid pool address');
    const { calldata } = NonfungiblePositionManager.collectCallParameters({
        tokenId: params.tokenId,
        expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenA, wethAddress)
            ? Ether.onChain(chainId)
            : tokenA, 0),
        expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenB, wethAddress)
            ? Ether.onChain(chainId)
            : tokenB, 0),
        recipient: fundAddress
    });
    return calldata;
};
const rebalance = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const executeParams = await rebalanceCalldata(chainId, signer, maker, params, fundAddress, refundGas || false);
    return await new Fund(chainId, signer, fundAddress).executeMulticall(executeParams, overrides);
};
const addLiquidityCalldataSingle = async (chainId, signer, maker, fundAddress, params, refundGas) => {
    const wethAddress = WethAddress[chainId];
    const calldata = await addLiquidityCalldata(chainId, signer, params, fundAddress);
    const ethAmount = calcEthAmount(params, wethAddress);
    return await new Fund(chainId, signer, fundAddress).executeOrderCallData(fundAddress, calldata, ethAmount, maker, refundGas);
};
const rebalanceCalldata = async (chainId, signer, maker, params, fundAddress, refundGas) => {
    const calldatas = [];
    if (params.removeData) {
        const removeCalldata = await removeLiquidityMulticallCalldata(chainId, signer, maker, fundAddress, params.removeData, refundGas);
        calldatas.push(removeCalldata);
    }
    if (params.swapData) {
        const swapCalldata = await swapMulticallCalldata(chainId, signer, maker, fundAddress, params.swapData);
        calldatas.push(swapCalldata);
    }
    if (params.addData) {
        const addCalldata = await addLiquidityCalldataSingle(chainId, signer, maker, fundAddress, params.addData, refundGas);
        calldatas.push(addCalldata);
    }
    return calldatas;
};
const calcEthAmount = (params, wethAddress) => {
    if (!params.useNative)
        return constants.Zero;
    if (isEqualAddress(params.tokenA, wethAddress))
        return params.amountA;
    if (isEqualAddress(params.tokenB, wethAddress))
        return params.amountB;
    return constants.Zero;
};
const executeLP = async (chainId, signer, maker, recipient, params, refundGas, overrides) => {
    switch (params.opType) {
        case 'addLiquidity':
            return await addLiquidity(chainId, signer, maker, recipient, params, refundGas, overrides);
        case 'removeLiquidity':
            return await removeLiquidity(chainId, signer, maker, recipient, params, refundGas, overrides);
        case 'collectFee':
            return await collectFee(chainId, signer, maker, recipient, params, refundGas, overrides);
        case 'rebalance':
            return await rebalance(chainId, signer, maker, recipient, params, refundGas, overrides);
    }
};
export { executeLP };
