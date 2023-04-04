"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapRouterAddress = exports.PathFinderAddress = exports.FundManagerAddress = exports.SupportedChainId = exports.ERC20ABI = exports.Weth9ABI = exports.PathFinderABI = exports.SwapRouter02ABI = exports.FundManagerABI = void 0;
var ERC20ABI = __importStar(require("../abis/ERC20.json"));
exports.ERC20ABI = ERC20ABI;
var FundManagerABI = __importStar(require("../abis/FundManager.json"));
exports.FundManagerABI = FundManagerABI;
var PathFinderABI = __importStar(require("../abis/PathFinder.json"));
exports.PathFinderABI = PathFinderABI;
var SwapRouter02ABI = __importStar(require("../abis/SwapRouter02.json"));
exports.SwapRouter02ABI = SwapRouter02ABI;
var Weth9ABI = __importStar(require("../abis/Weth9.json"));
exports.Weth9ABI = Weth9ABI;
var SupportedChainId;
(function (SupportedChainId) {
    SupportedChainId[SupportedChainId["MAINNET"] = 1] = "MAINNET";
    SupportedChainId[SupportedChainId["GOERLI"] = 5] = "GOERLI";
})(SupportedChainId = exports.SupportedChainId || (exports.SupportedChainId = {}));
exports.FundManagerAddress = (_a = {},
    _a[SupportedChainId.MAINNET] = '0x22fCce8f007D61AA933e29f6dDf756d73B6F39F1',
    _a[SupportedChainId.GOERLI] = '0xD64A92E7df4f7fdA24861f8C080b25E33649AF46',
    _a);
exports.PathFinderAddress = (_b = {},
    _b[SupportedChainId.MAINNET] = '0xef1C2f9532BdBBbaE8Ed22ABAB24Ac98F9513e67',
    _b[SupportedChainId.GOERLI] = '0x5681C896d42C57981Fb7990a0315fA2226aaC149',
    _b);
exports.SwapRouterAddress = (_c = {},
    _c[SupportedChainId.MAINNET] = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    _c[SupportedChainId.GOERLI] = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    _c);
