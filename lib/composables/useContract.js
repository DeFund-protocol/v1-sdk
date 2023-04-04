"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEncodeFuncData = exports.useContract = void 0;
var ethers_1 = require("ethers");
var useContract = function (addr, abi, provider) {
    return new ethers_1.Contract(addr, abi, provider);
};
exports.useContract = useContract;
var useInterface = function (abi) {
    return new ethers_1.utils.Interface(abi);
};
var useEncodeFuncData = function (abi, funcName, funcData) {
    return useInterface(abi).encodeFunctionData(funcName, funcData);
};
exports.useEncodeFuncData = useEncodeFuncData;
