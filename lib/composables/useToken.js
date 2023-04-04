"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToken = void 0;
var token_list_1 = require("token-list");
var useToken = function (chainId, addressOrSymbol) {
    return new token_list_1.TokenList(chainId).token(addressOrSymbol);
};
exports.useToken = useToken;
