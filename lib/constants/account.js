"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignerAccount = void 0;
var ethers_1 = require("ethers");
var SignerAccount = function (privateKey, provider) {
    return new ethers_1.Wallet(privateKey, provider);
};
exports.SignerAccount = SignerAccount;
