"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WethAddress = exports.NativeETHAddress = void 0;
var useToken_1 = require("../composables/useToken");
exports.NativeETHAddress = '0x0000000000000000000000000000000000000002';
var WethAddress = function (chainId) {
    return (0, useToken_1.useToken)(chainId, 'WETH').address;
};
exports.WethAddress = WethAddress;
