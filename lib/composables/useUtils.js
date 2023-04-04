"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqualAddress = exports.isAddress = void 0;
var utils_1 = require("ethers/lib/utils");
var isAddress = function (value) {
    try {
        return (0, utils_1.getAddress)(value);
    }
    catch (_a) {
        return false;
    }
};
exports.isAddress = isAddress;
var isEqualAddress = function (address1, address2) {
    return (isAddress(address1) &&
        isAddress(address2) &&
        (0, utils_1.getAddress)(address1) === (0, utils_1.getAddress)(address2));
};
exports.isEqualAddress = isEqualAddress;
