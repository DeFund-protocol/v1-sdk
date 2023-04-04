"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExecuteSwap = void 0;
var ethers_1 = require("ethers");
var contract_1 = require("../constants/contract");
var token_1 = require("../constants/token");
var useContract_1 = require("./useContract");
var usePathFinder_1 = require("./usePathFinder");
var useUtils_1 = require("./useUtils");
var useWeb3_1 = require("./useWeb3");
var approveToken = function (maker, fundAddress, params, options, chainId, signer) { return __awaiter(void 0, void 0, void 0, function () {
    var contract, allowance, calldata, executeParams;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                contract = (0, useContract_1.useContract)(params.token, contract_1.ERC20ABI, signer);
                return [4 /*yield*/, contract.allowance(fundAddress, contract_1.SwapRouterAddress)];
            case 1:
                allowance = _a.sent();
                if (allowance.gte(ethers_1.constants.MaxUint256))
                    return [2 /*return*/, [{}, null, null]];
                calldata = approveTokenCalldata();
                executeParams = [
                    fundAddress,
                    params.token,
                    calldata,
                    0,
                    maker,
                    true, // refund gas from fund
                ];
                return [4 /*yield*/, (0, useWeb3_1.SendTransaction)(contract_1.FundManagerAddress[chainId], contract_1.FundManagerABI, 'executeOrder', executeParams, options, signer)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var approveTokenCalldata = function () {
    return encodeCalldata(contract_1.ERC20ABI, 'approve', [
        contract_1.SwapRouterAddress,
        ethers_1.constants.MaxUint256,
    ]);
};
var useExecuteSwap = function (maker, fundAddress, params, options, chainId, signer) { return __awaiter(void 0, void 0, void 0, function () {
    var ethAmount, calldata, _a, executeParams;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                ethAmount = calcEthAmount(params, chainId);
                _a = params.opType;
                switch (_a) {
                    case 'approveToken': return [3 /*break*/, 1];
                    case 'exactInput': return [3 /*break*/, 3];
                    case 'exactOutput': return [3 /*break*/, 5];
                }
                return [3 /*break*/, 7];
            case 1: return [4 /*yield*/, approveToken(maker, fundAddress, params, options, chainId, signer)];
            case 2: return [2 /*return*/, _b.sent()];
            case 3: return [4 /*yield*/, exactInputCalldata(params, fundAddress, chainId, signer)];
            case 4:
                calldata = _b.sent();
                return [3 /*break*/, 8];
            case 5: return [4 /*yield*/, exactOutPutCalldata(params, fundAddress, chainId, signer)];
            case 6:
                calldata = _b.sent();
                return [3 /*break*/, 8];
            case 7: throw new Error("Invalid opType: ".concat(params.opType));
            case 8:
                executeParams = [
                    fundAddress,
                    contract_1.SwapRouterAddress,
                    calldata,
                    ethAmount,
                    maker,
                    true,
                ];
                return [4 /*yield*/, (0, useWeb3_1.SendTransaction)(contract_1.FundManagerAddress[chainId], contract_1.FundManagerABI, 'executeOrder', executeParams, options, signer)];
            case 9: return [2 /*return*/, _b.sent()];
        }
    });
}); };
exports.useExecuteSwap = useExecuteSwap;
var calcEthAmount = function (params, chainId) {
    if (!params.useNative)
        return ethers_1.constants.Zero;
    if (!(0, useUtils_1.isEqualAddress)(params.tokenIn, (0, token_1.WethAddress)(chainId)))
        return ethers_1.constants.Zero;
    return params.amountIn;
};
var calcRecipient = function (params, recipient, chainId) {
    if (!params.useNative)
        return recipient;
    if (!(0, useUtils_1.isEqualAddress)(params.tokenOut, (0, token_1.WethAddress)(chainId)))
        return recipient;
    return token_1.NativeETHAddress;
};
var exactInputCalldata = function (params, recipient, chainId, provider) { return __awaiter(void 0, void 0, void 0, function () {
    var path, swapParams, calldata, unwrap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, usePathFinder_1.exactInputPath)(params.tokenIn, params.tokenOut, params.amountIn, chainId, provider)];
            case 1:
                path = _a.sent();
                swapParams = {
                    recipient: calcRecipient(params, recipient, chainId),
                    path: path.path,
                    amountIn: params.amountIn,
                    amountOutMinimum: params.amountOut,
                };
                calldata = encodeCalldata(contract_1.SwapRouter02ABI, 'exactInput', [swapParams]);
                if (!params.useNative)
                    return [2 /*return*/, calldata];
                if (!(0, useUtils_1.isEqualAddress)(params.tokenOut, (0, token_1.WethAddress)(chainId)))
                    return [2 /*return*/, calldata];
                unwrap = encodeCalldata(contract_1.SwapRouter02ABI, 'unwrapWETH9(uint256,address)', [params.amountOut, recipient]);
                return [2 /*return*/, encodeCalldata(contract_1.SwapRouter02ABI, 'multicall(uint256,bytes[])', [
                        params.expiration,
                        [calldata, unwrap],
                    ])];
        }
    });
}); };
var exactOutPutCalldata = function (params, recipient, chainId, provider) { return __awaiter(void 0, void 0, void 0, function () {
    var path, swapParams, output, refund, unwrap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, usePathFinder_1.exactOutputPath)(params.tokenIn, params.tokenOut, params.amountOut, chainId, provider)];
            case 1:
                path = _a.sent();
                swapParams = {
                    recipient: calcRecipient(params, recipient, chainId),
                    path: path.path,
                    amountOut: params.amountOut,
                    amountInMaximum: params.amountIn,
                };
                output = encodeCalldata(contract_1.SwapRouter02ABI, 'exactOutput', [swapParams]);
                if (!params.useNative)
                    return [2 /*return*/, output];
                switch (true) {
                    case (0, useUtils_1.isEqualAddress)(params.tokenIn, (0, token_1.WethAddress)(chainId)):
                        refund = encodeCalldata(contract_1.SwapRouter02ABI, 'refundETH()', []);
                        return [2 /*return*/, encodeCalldata(contract_1.SwapRouter02ABI, 'multicall(uint256,bytes[])', [
                                params.expiration,
                                [output, refund],
                            ])];
                    case (0, useUtils_1.isEqualAddress)(params.tokenOut, (0, token_1.WethAddress)(chainId)):
                        unwrap = encodeCalldata(contract_1.SwapRouter02ABI, 'unwrapWETH9(uint256,address)', [params.amountOut, recipient]);
                        return [2 /*return*/, encodeCalldata(contract_1.SwapRouter02ABI, 'multicall(uint256,bytes[])', [
                                params.expiration,
                                [output, unwrap],
                            ])];
                    default:
                        return [2 /*return*/, output];
                }
                return [2 /*return*/];
        }
    });
}); };
var encodeCalldata = function (abi, method, params) {
    return (0, useContract_1.useEncodeFuncData)(abi, method, params);
};
