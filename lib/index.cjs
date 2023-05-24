'use strict';

var ethers = require('ethers');
var IUniswapV3Factory = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json');
var IUniswapV3Pool = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
var v3Sdk = require('@uniswap/v3-sdk');
var tokenList = require('@defund-protocol/token-list');
var utils = require('ethers/lib/utils');
var sdkCore = require('@uniswap/sdk-core');
var mathjs = require('mathjs');

const useContract = (addr, abi, provider) => {
    return new ethers.Contract(addr, abi, provider);
};
const useInterface = (abi) => {
    return new ethers.utils.Interface(abi);
};
const useEncodeFuncData = (abi, funcName, funcData) => {
    return useInterface(abi).encodeFunctionData(funcName, funcData);
};

var ERC20ABI = [
	{
		inputs: [
			{
				internalType: "uint256",
				name: "supply",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "name",
				type: "string"
			},
			{
				internalType: "string",
				name: "symbol",
				type: "string"
			},
			{
				internalType: "uint8",
				name: "decimals_",
				type: "uint8"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "spender",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "subtractedValue",
				type: "uint256"
			}
		],
		name: "decreaseAllowance",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "addedValue",
				type: "uint256"
			}
		],
		name: "increaseAllowance",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var FundManagerABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_proxy",
				type: "address"
			},
			{
				internalType: "address",
				name: "_weth9",
				type: "address"
			},
			{
				internalType: "address",
				name: "_gasPriceOracle",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "FundAssetPriorityUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "gp",
				type: "address"
			}
		],
		name: "FundCreated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "FundOperatorUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint8",
				name: "version",
				type: "uint8"
			}
		],
		name: "Initialized",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "protocol",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "maker",
				type: "address"
			},
			{
				indexed: false,
				internalType: "string",
				name: "info",
				type: "string"
			}
		],
		name: "OrderExecuted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "OwnershipTransferred",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "Paused",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "Unpaused",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "positionId",
				type: "uint256"
			}
		],
		name: "closePosition",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "underlyingToken",
						type: "address"
					},
					{
						internalType: "bool",
						name: "allowPosition",
						type: "bool"
					},
					{
						internalType: "address[]",
						name: "allowedTokens",
						type: "address[]"
					},
					{
						internalType: "uint16",
						name: "managementFee",
						type: "uint16"
					},
					{
						internalType: "uint24[]",
						name: "carryBrackets",
						type: "uint24[]"
					},
					{
						internalType: "uint16[]",
						name: "carryRates",
						type: "uint16[]"
					},
					{
						internalType: "address",
						name: "gp",
						type: "address"
					},
					{
						internalType: "address[]",
						name: "operators",
						type: "address[]"
					},
					{
						internalType: "uint16",
						name: "maxLpCount",
						type: "uint16"
					},
					{
						internalType: "uint256",
						name: "firstBuyMinAmount",
						type: "uint256"
					},
					{
						internalType: "bool",
						name: "isPublic",
						type: "bool"
					},
					{
						internalType: "address[]",
						name: "allowedLps",
						type: "address[]"
					},
					{
						internalType: "uint32",
						name: "lockTime",
						type: "uint32"
					},
					{
						internalType: "uint16",
						name: "lockFee",
						type: "uint16"
					}
				],
				internalType: "struct FundFactory.FundCreateParams",
				name: "p",
				type: "tuple"
			}
		],
		name: "createFund",
		outputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "target",
				type: "address"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "maker",
				type: "address"
			},
			{
				internalType: "bool",
				name: "refundGas",
				type: "bool"
			}
		],
		name: "executeOrder",
		outputs: [
			{
				internalType: "bool",
				name: "success",
				type: "bool"
			},
			{
				internalType: "bytes",
				name: "result",
				type: "bytes"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "fundActivePositions",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "fundAllowTokens",
		outputs: [
			{
				internalType: "address[]",
				name: "",
				type: "address[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "getFundDetail",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "gp",
						type: "address"
					},
					{
						internalType: "bool",
						name: "allowPosition",
						type: "bool"
					},
					{
						internalType: "address[]",
						name: "allowedTokens",
						type: "address[]"
					},
					{
						internalType: "address[]",
						name: "allowedOperators",
						type: "address[]"
					}
				],
				internalType: "struct FundManagerData",
				name: "data",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "role",
				type: "uint256"
			}
		],
		name: "getFundList",
		outputs: [
			{
				internalType: "address[]",
				name: "funds",
				type: "address[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "positionId",
				type: "uint256"
			}
		],
		name: "getPositionAssetPriority",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "getTokenAssetPriority",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address[]",
						name: "allowedUnderlyingTokens",
						type: "address[]"
					},
					{
						internalType: "address[]",
						name: "allowedTokens",
						type: "address[]"
					},
					{
						components: [
							{
								internalType: "address",
								name: "tokenA",
								type: "address"
							},
							{
								internalType: "address",
								name: "tokenB",
								type: "address"
							},
							{
								internalType: "uint24",
								name: "fee",
								type: "uint24"
							},
							{
								internalType: "address",
								name: "pool",
								type: "address"
							}
						],
						internalType: "struct PoolParams[]",
						name: "allowedPools",
						type: "tuple[]"
					},
					{
						internalType: "uint256",
						name: "minManagementFee",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "maxManagementFee",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "minCarriedInterest",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "maxCarriedInterest",
						type: "uint256"
					},
					{
						internalType: "address[]",
						name: "orderAddresses",
						type: "address[]"
					}
				],
				internalType: "struct FundManagerInitializeParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "initialize",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "address",
				name: "underlying",
				type: "address"
			},
			{
				internalType: "bytes",
				name: "path",
				type: "bytes"
			}
		],
		name: "isPathAllowed",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint24",
				name: "fee",
				type: "uint24"
			}
		],
		name: "isPoolParamsAllowed",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			}
		],
		name: "multicall",
		outputs: [
			{
				internalType: "bytes[]",
				name: "results",
				type: "bytes[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "pause",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "paused",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "renounceOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint256",
						name: "sellType",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "minPriority",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "lastRatio",
						type: "uint256"
					},
					{
						internalType: "uint256[]",
						name: "selectPriority",
						type: "uint256[]"
					},
					{
						internalType: "uint256[]",
						name: "selectRatio",
						type: "uint256[]"
					},
					{
						internalType: "address",
						name: "underlying",
						type: "address"
					},
					{
						internalType: "bytes[]",
						name: "paths",
						type: "bytes[]"
					},
					{
						internalType: "uint24",
						name: "fee",
						type: "uint24"
					}
				],
				internalType: "struct PrioritySellParams",
				name: "params",
				type: "tuple"
			},
			{
				internalType: "bool",
				name: "refundGas",
				type: "bool"
			}
		],
		name: "sellAssets",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "transferOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "unpause",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address[]",
				name: "tokens",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "values0",
				type: "uint256[]"
			},
			{
				internalType: "uint256[]",
				name: "positions",
				type: "uint256[]"
			},
			{
				internalType: "uint256[]",
				name: "values1",
				type: "uint256[]"
			}
		],
		name: "updateAssetPriority",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "min",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "max",
				type: "uint256"
			}
		],
		name: "updateCarriedInterest",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "lp",
				type: "address"
			},
			{
				internalType: "bool",
				name: "flag",
				type: "bool"
			}
		],
		name: "updateFundOfLp",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "gp",
				type: "address"
			}
		],
		name: "updateGp",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "min",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "max",
				type: "uint256"
			}
		],
		name: "updateManagementFee",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address[]",
				name: "operators",
				type: "address[]"
			}
		],
		name: "updateOperators",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address"
			},
			{
				internalType: "bool",
				name: "allow",
				type: "bool"
			}
		],
		name: "updateOrderAddress",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address[]",
				name: "removeLps",
				type: "address[]"
			},
			{
				internalType: "address[]",
				name: "addLps",
				type: "address[]"
			}
		],
		name: "updatePendingFundOfLp",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenA",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenB",
				type: "address"
			},
			{
				internalType: "uint24",
				name: "fee",
				type: "uint24"
			},
			{
				internalType: "address",
				name: "pool",
				type: "address"
			},
			{
				internalType: "bool",
				name: "allow",
				type: "bool"
			}
		],
		name: "updatePool",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "bool",
				name: "allow",
				type: "bool"
			}
		],
		name: "updateToken",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "bool",
				name: "allow",
				type: "bool"
			}
		],
		name: "updateUnderlyingToken",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var FundProxyABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_weth",
				type: "address"
			},
			{
				internalType: "address",
				name: "_masterAccount",
				type: "address"
			},
			{
				internalType: "address",
				name: "_fundOracle",
				type: "address"
			},
			{
				internalType: "address",
				name: "_gasPriceOracle",
				type: "address"
			},
			{
				internalType: "address",
				name: "daoAddress",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "daoProfit",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "closeAddresses",
				type: "address[]"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "FundAllowLpUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "FundAssetSold",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "lp",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "unit",
				type: "uint256"
			}
		],
		name: "FundBuy",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "FundCollect",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: false,
				internalType: "bool",
				name: "flag",
				type: "bool"
			}
		],
		name: "FundForbidBuyUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "nomination",
				type: "address"
			}
		],
		name: "FundGpNominationAccepted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "nomination",
				type: "address"
			}
		],
		name: "FundGpNominationUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "lp",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "unit",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "base",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "carry",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "dao",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "fee",
				type: "uint256"
			}
		],
		name: "FundSell",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "lp",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint24",
				name: "stopLoss",
				type: "uint24"
			}
		],
		name: "FundStopLossUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint8",
				name: "version",
				type: "uint8"
			}
		],
		name: "Initialized",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "OwnershipTransferred",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "Paused",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "Unpaused",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "acceptGpNomination",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "buy",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "collect",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "gp",
				type: "address"
			},
			{
				internalType: "bool",
				name: "isPublic",
				type: "bool"
			},
			{
				internalType: "address[]",
				name: "allowedLps",
				type: "address[]"
			},
			{
				internalType: "uint16",
				name: "managementFee",
				type: "uint16"
			},
			{
				internalType: "uint24[]",
				name: "carryBrackets",
				type: "uint24[]"
			},
			{
				internalType: "uint16[]",
				name: "carryRates",
				type: "uint16[]"
			},
			{
				internalType: "address",
				name: "underlyingToken",
				type: "address"
			},
			{
				internalType: "uint16",
				name: "maxLpCount",
				type: "uint16"
			},
			{
				internalType: "uint256",
				name: "firstBuyMinAmount",
				type: "uint256"
			},
			{
				internalType: "uint32",
				name: "lockTime",
				type: "uint32"
			},
			{
				internalType: "uint16",
				name: "lockFee",
				type: "uint16"
			}
		],
		name: "createAccount",
		outputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			}
		],
		name: "getFundDetail",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "gpNomination",
						type: "address"
					},
					{
						internalType: "address",
						name: "underlyingToken",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "firstBuyMinAmount",
						type: "uint256"
					},
					{
						internalType: "address[]",
						name: "allowedLps",
						type: "address[]"
					},
					{
						internalType: "bool",
						name: "isPublic",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "forbidBuy",
						type: "bool"
					},
					{
						internalType: "uint16",
						name: "maxLpCount",
						type: "uint16"
					},
					{
						internalType: "uint24[]",
						name: "carryBrackets",
						type: "uint24[]"
					},
					{
						internalType: "uint16[]",
						name: "carryRates",
						type: "uint16[]"
					},
					{
						internalType: "uint16",
						name: "managementFee",
						type: "uint16"
					},
					{
						internalType: "uint16",
						name: "lockFee",
						type: "uint16"
					},
					{
						internalType: "uint32",
						name: "lockTime",
						type: "uint32"
					},
					{
						internalType: "uint32",
						name: "since",
						type: "uint32"
					},
					{
						internalType: "uint16",
						name: "lpCount",
						type: "uint16"
					},
					{
						internalType: "uint256",
						name: "ethBalance",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalValue",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalUnit",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "finalNav",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "paidDaoProfitAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "paidCarriedInterestAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalManagementFeeAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "collectedManagementFeeAmount",
						type: "uint256"
					}
				],
				internalType: "struct FundProxyData",
				name: "data",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "lp",
				type: "address"
			}
		],
		name: "getFundLpDetail",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "totalAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalUnit",
						type: "uint256"
					},
					{
						internalType: "uint24",
						name: "stopLoss",
						type: "uint24"
					},
					{
						internalType: "uint24",
						name: "buyUnitIndex",
						type: "uint24"
					},
					{
						internalType: "uint256",
						name: "buyUnitLeft",
						type: "uint256"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "amount",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "unit",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "time",
								type: "uint256"
							}
						],
						internalType: "struct LpBuyAction[]",
						name: "lpBuyActions",
						type: "tuple[]"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "amount",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "unit",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "time",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "base",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "carry",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "dao",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "fee",
								type: "uint256"
							}
						],
						internalType: "struct LpSellAction[]",
						name: "lpSellActions",
						type: "tuple[]"
					}
				],
				internalType: "struct LpDetail",
				name: "data",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "skip",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "size",
				type: "uint256"
			}
		],
		name: "getFundLps",
		outputs: [
			{
				internalType: "address[]",
				name: "list",
				type: "address[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_manager",
				type: "address"
			}
		],
		name: "initialize",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			}
		],
		name: "multicall",
		outputs: [
			{
				internalType: "bytes[]",
				name: "results",
				type: "bytes[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "pause",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "paused",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "renounceOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "lp",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "ratio",
				type: "uint256"
			},
			{
				components: [
					{
						internalType: "uint256",
						name: "sellType",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "minPriority",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "lastRatio",
						type: "uint256"
					},
					{
						internalType: "uint256[]",
						name: "selectPriority",
						type: "uint256[]"
					},
					{
						internalType: "uint256[]",
						name: "selectRatio",
						type: "uint256[]"
					},
					{
						internalType: "address",
						name: "underlying",
						type: "address"
					},
					{
						internalType: "bytes[]",
						name: "paths",
						type: "bytes[]"
					},
					{
						internalType: "uint24",
						name: "fee",
						type: "uint24"
					}
				],
				internalType: "struct PrioritySellParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "sell",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint256",
						name: "sellType",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "minPriority",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "lastRatio",
						type: "uint256"
					},
					{
						internalType: "uint256[]",
						name: "selectPriority",
						type: "uint256[]"
					},
					{
						internalType: "uint256[]",
						name: "selectRatio",
						type: "uint256[]"
					},
					{
						internalType: "address",
						name: "underlying",
						type: "address"
					},
					{
						internalType: "bytes[]",
						name: "paths",
						type: "bytes[]"
					},
					{
						internalType: "uint24",
						name: "fee",
						type: "uint24"
					}
				],
				internalType: "struct PrioritySellParams",
				name: "params",
				type: "tuple"
			},
			{
				internalType: "address",
				name: "refundRecipient",
				type: "address"
			}
		],
		name: "sellAssets",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "transferOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "unpause",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address[]",
				name: "lps",
				type: "address[]"
			}
		],
		name: "updateAllowLps",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address"
			},
			{
				internalType: "bool",
				name: "allow",
				type: "bool"
			}
		],
		name: "updateCloseAddress",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "addr",
				type: "address"
			}
		],
		name: "updateDaoAddress",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "profit",
				type: "uint256"
			}
		],
		name: "updateDaoProfit",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "updateFirstBuyMinAmount",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "bool",
				name: "flag",
				type: "bool"
			}
		],
		name: "updateForbidBuy",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "nomination",
				type: "address"
			}
		],
		name: "updateGpNomination",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint16",
				name: "value",
				type: "uint16"
			}
		],
		name: "updateMaxLpCount",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint24",
				name: "value",
				type: "uint24"
			}
		],
		name: "updateStopLoss",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "weth9",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

var FundViewerABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_weth9",
				type: "address"
			},
			{
				internalType: "address",
				name: "_proxy",
				type: "address"
			},
			{
				internalType: "address",
				name: "_manager",
				type: "address"
			},
			{
				internalType: "address",
				name: "_priceOracle",
				type: "address"
			},
			{
				internalType: "address",
				name: "_positionViewer",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				internalType: "bool",
				name: "extend",
				type: "bool"
			}
		],
		name: "getFundData",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "addr",
						type: "address"
					},
					{
						internalType: "uint32",
						name: "since",
						type: "uint32"
					},
					{
						internalType: "address",
						name: "gp",
						type: "address"
					},
					{
						internalType: "uint16",
						name: "managementFee",
						type: "uint16"
					},
					{
						internalType: "uint24[]",
						name: "carryBrackets",
						type: "uint24[]"
					},
					{
						internalType: "uint16[]",
						name: "carryRates",
						type: "uint16[]"
					},
					{
						internalType: "address",
						name: "underlyingToken",
						type: "address"
					},
					{
						internalType: "bool",
						name: "allowPosition",
						type: "bool"
					},
					{
						internalType: "address[]",
						name: "allowedTokens",
						type: "address[]"
					},
					{
						internalType: "address[]",
						name: "allowedOperators",
						type: "address[]"
					},
					{
						internalType: "bool",
						name: "operator",
						type: "bool"
					},
					{
						internalType: "uint16",
						name: "activePositionCount",
						type: "uint16"
					},
					{
						internalType: "uint32",
						name: "opened",
						type: "uint32"
					},
					{
						internalType: "uint256",
						name: "finalValue",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "finalUnit",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalUnit",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalManagementFeeAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "paidDaoProfitAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "paidCarriedInterestAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "collectedManagementFeeAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "ethBalance",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalValue",
						type: "uint256"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "totalAmount",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "totalUnit",
								type: "uint256"
							},
							{
								internalType: "uint24",
								name: "stopLoss",
								type: "uint24"
							},
							{
								internalType: "uint24",
								name: "buyUnitIndex",
								type: "uint24"
							},
							{
								internalType: "uint256",
								name: "buyUnitLeft",
								type: "uint256"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "amount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "unit",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "time",
										type: "uint256"
									}
								],
								internalType: "struct LpBuyAction[]",
								name: "lpBuyActions",
								type: "tuple[]"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "amount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "unit",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "time",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "base",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "carry",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "dao",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "fee",
										type: "uint256"
									}
								],
								internalType: "struct LpSellAction[]",
								name: "lpSellActions",
								type: "tuple[]"
							}
						],
						internalType: "struct LpDetail",
						name: "callerDetail",
						type: "tuple"
					},
					{
						internalType: "address",
						name: "gpNomination",
						type: "address"
					},
					{
						internalType: "uint16",
						name: "lpCount",
						type: "uint16"
					},
					{
						internalType: "uint16",
						name: "maxLpCount",
						type: "uint16"
					},
					{
						internalType: "uint256",
						name: "firstBuyMinAmount",
						type: "uint256"
					},
					{
						internalType: "bool",
						name: "isPublic",
						type: "bool"
					},
					{
						internalType: "address[]",
						name: "allowedLps",
						type: "address[]"
					},
					{
						internalType: "uint32",
						name: "lockTime",
						type: "uint32"
					},
					{
						internalType: "uint16",
						name: "lockFee",
						type: "uint16"
					},
					{
						internalType: "bool",
						name: "forbidBuy",
						type: "bool"
					},
					{
						components: [
							{
								internalType: "address",
								name: "token",
								type: "address"
							},
							{
								internalType: "uint256",
								name: "balance",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "value",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "priority",
								type: "uint256"
							}
						],
						internalType: "struct TokenBalance[]",
						name: "tokenBalances",
						type: "tuple[]"
					},
					{
						components: [
							{
								internalType: "address",
								name: "lpAddr",
								type: "address"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "totalAmount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "totalUnit",
										type: "uint256"
									},
									{
										internalType: "uint24",
										name: "stopLoss",
										type: "uint24"
									},
									{
										internalType: "uint24",
										name: "buyUnitIndex",
										type: "uint24"
									},
									{
										internalType: "uint256",
										name: "buyUnitLeft",
										type: "uint256"
									},
									{
										components: [
											{
												internalType: "uint256",
												name: "amount",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "unit",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "time",
												type: "uint256"
											}
										],
										internalType: "struct LpBuyAction[]",
										name: "lpBuyActions",
										type: "tuple[]"
									},
									{
										components: [
											{
												internalType: "uint256",
												name: "amount",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "unit",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "time",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "base",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "carry",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "dao",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "fee",
												type: "uint256"
											}
										],
										internalType: "struct LpSellAction[]",
										name: "lpSellActions",
										type: "tuple[]"
									}
								],
								internalType: "struct LpDetail",
								name: "detail",
								type: "tuple"
							}
						],
						internalType: "struct LpDetailInfo[]",
						name: "lpDetailInfos",
						type: "tuple[]"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "tokenId",
								type: "uint256"
							},
							{
								internalType: "address",
								name: "token0",
								type: "address"
							},
							{
								internalType: "address",
								name: "token1",
								type: "address"
							},
							{
								internalType: "uint24",
								name: "fee",
								type: "uint24"
							},
							{
								internalType: "uint256",
								name: "amount0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "amount1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "fee0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "fee1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "amountValue0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "amountValue1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "feeValue0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "feeValue1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "priority",
								type: "uint256"
							}
						],
						internalType: "struct LPToken[]",
						name: "lpTokens",
						type: "tuple[]"
					}
				],
				internalType: "struct FundAccountData",
				name: "data",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "fund",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "skip",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "size",
				type: "uint256"
			}
		],
		name: "getFundLpDetailInfos",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "lpAddr",
						type: "address"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "totalAmount",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "totalUnit",
								type: "uint256"
							},
							{
								internalType: "uint24",
								name: "stopLoss",
								type: "uint24"
							},
							{
								internalType: "uint24",
								name: "buyUnitIndex",
								type: "uint24"
							},
							{
								internalType: "uint256",
								name: "buyUnitLeft",
								type: "uint256"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "amount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "unit",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "time",
										type: "uint256"
									}
								],
								internalType: "struct LpBuyAction[]",
								name: "lpBuyActions",
								type: "tuple[]"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "amount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "unit",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "time",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "base",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "carry",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "dao",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "fee",
										type: "uint256"
									}
								],
								internalType: "struct LpSellAction[]",
								name: "lpSellActions",
								type: "tuple[]"
							}
						],
						internalType: "struct LpDetail",
						name: "detail",
						type: "tuple"
					}
				],
				internalType: "struct LpDetailInfo[]",
				name: "list",
				type: "tuple[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "role",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "extend",
				type: "bool"
			}
		],
		name: "getFundsData",
		outputs: [
			{
				components: [
					{
						internalType: "address",
						name: "addr",
						type: "address"
					},
					{
						internalType: "uint32",
						name: "since",
						type: "uint32"
					},
					{
						internalType: "address",
						name: "gp",
						type: "address"
					},
					{
						internalType: "uint16",
						name: "managementFee",
						type: "uint16"
					},
					{
						internalType: "uint24[]",
						name: "carryBrackets",
						type: "uint24[]"
					},
					{
						internalType: "uint16[]",
						name: "carryRates",
						type: "uint16[]"
					},
					{
						internalType: "address",
						name: "underlyingToken",
						type: "address"
					},
					{
						internalType: "bool",
						name: "allowPosition",
						type: "bool"
					},
					{
						internalType: "address[]",
						name: "allowedTokens",
						type: "address[]"
					},
					{
						internalType: "address[]",
						name: "allowedOperators",
						type: "address[]"
					},
					{
						internalType: "bool",
						name: "operator",
						type: "bool"
					},
					{
						internalType: "uint16",
						name: "activePositionCount",
						type: "uint16"
					},
					{
						internalType: "uint32",
						name: "opened",
						type: "uint32"
					},
					{
						internalType: "uint256",
						name: "finalValue",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "finalUnit",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalUnit",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalManagementFeeAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "paidDaoProfitAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "paidCarriedInterestAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "collectedManagementFeeAmount",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "ethBalance",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "totalValue",
						type: "uint256"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "totalAmount",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "totalUnit",
								type: "uint256"
							},
							{
								internalType: "uint24",
								name: "stopLoss",
								type: "uint24"
							},
							{
								internalType: "uint24",
								name: "buyUnitIndex",
								type: "uint24"
							},
							{
								internalType: "uint256",
								name: "buyUnitLeft",
								type: "uint256"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "amount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "unit",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "time",
										type: "uint256"
									}
								],
								internalType: "struct LpBuyAction[]",
								name: "lpBuyActions",
								type: "tuple[]"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "amount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "unit",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "time",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "base",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "carry",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "dao",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "fee",
										type: "uint256"
									}
								],
								internalType: "struct LpSellAction[]",
								name: "lpSellActions",
								type: "tuple[]"
							}
						],
						internalType: "struct LpDetail",
						name: "callerDetail",
						type: "tuple"
					},
					{
						internalType: "address",
						name: "gpNomination",
						type: "address"
					},
					{
						internalType: "uint16",
						name: "lpCount",
						type: "uint16"
					},
					{
						internalType: "uint16",
						name: "maxLpCount",
						type: "uint16"
					},
					{
						internalType: "uint256",
						name: "firstBuyMinAmount",
						type: "uint256"
					},
					{
						internalType: "bool",
						name: "isPublic",
						type: "bool"
					},
					{
						internalType: "address[]",
						name: "allowedLps",
						type: "address[]"
					},
					{
						internalType: "uint32",
						name: "lockTime",
						type: "uint32"
					},
					{
						internalType: "uint16",
						name: "lockFee",
						type: "uint16"
					},
					{
						internalType: "bool",
						name: "forbidBuy",
						type: "bool"
					},
					{
						components: [
							{
								internalType: "address",
								name: "token",
								type: "address"
							},
							{
								internalType: "uint256",
								name: "balance",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "value",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "priority",
								type: "uint256"
							}
						],
						internalType: "struct TokenBalance[]",
						name: "tokenBalances",
						type: "tuple[]"
					},
					{
						components: [
							{
								internalType: "address",
								name: "lpAddr",
								type: "address"
							},
							{
								components: [
									{
										internalType: "uint256",
										name: "totalAmount",
										type: "uint256"
									},
									{
										internalType: "uint256",
										name: "totalUnit",
										type: "uint256"
									},
									{
										internalType: "uint24",
										name: "stopLoss",
										type: "uint24"
									},
									{
										internalType: "uint24",
										name: "buyUnitIndex",
										type: "uint24"
									},
									{
										internalType: "uint256",
										name: "buyUnitLeft",
										type: "uint256"
									},
									{
										components: [
											{
												internalType: "uint256",
												name: "amount",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "unit",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "time",
												type: "uint256"
											}
										],
										internalType: "struct LpBuyAction[]",
										name: "lpBuyActions",
										type: "tuple[]"
									},
									{
										components: [
											{
												internalType: "uint256",
												name: "amount",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "unit",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "time",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "base",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "carry",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "dao",
												type: "uint256"
											},
											{
												internalType: "uint256",
												name: "fee",
												type: "uint256"
											}
										],
										internalType: "struct LpSellAction[]",
										name: "lpSellActions",
										type: "tuple[]"
									}
								],
								internalType: "struct LpDetail",
								name: "detail",
								type: "tuple"
							}
						],
						internalType: "struct LpDetailInfo[]",
						name: "lpDetailInfos",
						type: "tuple[]"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "tokenId",
								type: "uint256"
							},
							{
								internalType: "address",
								name: "token0",
								type: "address"
							},
							{
								internalType: "address",
								name: "token1",
								type: "address"
							},
							{
								internalType: "uint24",
								name: "fee",
								type: "uint24"
							},
							{
								internalType: "uint256",
								name: "amount0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "amount1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "fee0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "fee1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "amountValue0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "amountValue1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "feeValue0",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "feeValue1",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "priority",
								type: "uint256"
							}
						],
						internalType: "struct LPToken[]",
						name: "lpTokens",
						type: "tuple[]"
					}
				],
				internalType: "struct FundAccountData[]",
				name: "dataList",
				type: "tuple[]"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

var PathFinderABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_quoter",
				type: "address"
			},
			{
				internalType: "address[]",
				name: "_tokens",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "_fundManager",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "OwnershipTransferred",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "tokens",
				type: "address[]"
			}
		],
		name: "bestExactInputPath",
		outputs: [
			{
				components: [
					{
						internalType: "bytes",
						name: "path",
						type: "bytes"
					},
					{
						internalType: "uint256",
						name: "expectedAmount",
						type: "uint256"
					},
					{
						internalType: "uint160[]",
						name: "sqrtPriceX96AfterList",
						type: "uint160[]"
					},
					{
						internalType: "uint32[]",
						name: "initializedTicksCrossedList",
						type: "uint32[]"
					},
					{
						internalType: "uint256",
						name: "gasEstimate",
						type: "uint256"
					}
				],
				internalType: "struct IPathFinder.TradePath",
				name: "path",
				type: "tuple"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "tokens",
				type: "address[]"
			}
		],
		name: "bestExactOutputPath",
		outputs: [
			{
				components: [
					{
						internalType: "bytes",
						name: "path",
						type: "bytes"
					},
					{
						internalType: "uint256",
						name: "expectedAmount",
						type: "uint256"
					},
					{
						internalType: "uint160[]",
						name: "sqrtPriceX96AfterList",
						type: "uint160[]"
					},
					{
						internalType: "uint32[]",
						name: "initializedTicksCrossedList",
						type: "uint32[]"
					},
					{
						internalType: "uint256",
						name: "gasEstimate",
						type: "uint256"
					}
				],
				internalType: "struct IPathFinder.TradePath",
				name: "path",
				type: "tuple"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "exactInputPath",
		outputs: [
			{
				components: [
					{
						internalType: "bytes",
						name: "path",
						type: "bytes"
					},
					{
						internalType: "uint256",
						name: "expectedAmount",
						type: "uint256"
					},
					{
						internalType: "uint160[]",
						name: "sqrtPriceX96AfterList",
						type: "uint160[]"
					},
					{
						internalType: "uint32[]",
						name: "initializedTicksCrossedList",
						type: "uint32[]"
					},
					{
						internalType: "uint256",
						name: "gasEstimate",
						type: "uint256"
					}
				],
				internalType: "struct IPathFinder.TradePath",
				name: "path",
				type: "tuple"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "tokenIn",
				type: "address"
			},
			{
				internalType: "address",
				name: "tokenOut",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "exactOutputPath",
		outputs: [
			{
				components: [
					{
						internalType: "bytes",
						name: "path",
						type: "bytes"
					},
					{
						internalType: "uint256",
						name: "expectedAmount",
						type: "uint256"
					},
					{
						internalType: "uint160[]",
						name: "sqrtPriceX96AfterList",
						type: "uint160[]"
					},
					{
						internalType: "uint32[]",
						name: "initializedTicksCrossedList",
						type: "uint32[]"
					},
					{
						internalType: "uint256",
						name: "gasEstimate",
						type: "uint256"
					}
				],
				internalType: "struct IPathFinder.TradePath",
				name: "path",
				type: "tuple"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "fundManager",
		outputs: [
			{
				internalType: "contract IFundManager",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getFees",
		outputs: [
			{
				internalType: "uint24[]",
				name: "",
				type: "uint24[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getSharedTokens",
		outputs: [
			{
				internalType: "address[]",
				name: "",
				type: "address[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "quoter",
		outputs: [
			{
				internalType: "contract IQuoterV2",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "renounceOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "transferOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint24[]",
				name: "_fees",
				type: "uint24[]"
			}
		],
		name: "updateFees",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "tokens",
				type: "address[]"
			}
		],
		name: "updateTokens",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var NonfungiblePositionManagerABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_factory",
				type: "address"
			},
			{
				internalType: "address",
				name: "_WETH9",
				type: "address"
			},
			{
				internalType: "address",
				name: "_tokenDescriptor_",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "approved",
				type: "address"
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				indexed: false,
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "ApprovalForAll",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "address",
				name: "recipient",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		name: "Collect",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint128",
				name: "liquidity",
				type: "uint128"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		name: "DecreaseLiquidity",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint128",
				name: "liquidity",
				type: "uint128"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		name: "IncreaseLiquidity",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		inputs: [
		],
		name: "DOMAIN_SEPARATOR",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "PERMIT_TYPEHASH",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "WETH9",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "baseURI",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "burn",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "tokenId",
						type: "uint256"
					},
					{
						internalType: "address",
						name: "recipient",
						type: "address"
					},
					{
						internalType: "uint128",
						name: "amount0Max",
						type: "uint128"
					},
					{
						internalType: "uint128",
						name: "amount1Max",
						type: "uint128"
					}
				],
				internalType: "struct INonfungiblePositionManager.CollectParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "collect",
		outputs: [
			{
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token0",
				type: "address"
			},
			{
				internalType: "address",
				name: "token1",
				type: "address"
			},
			{
				internalType: "uint24",
				name: "fee",
				type: "uint24"
			},
			{
				internalType: "uint160",
				name: "sqrtPriceX96",
				type: "uint160"
			}
		],
		name: "createAndInitializePoolIfNecessary",
		outputs: [
			{
				internalType: "address",
				name: "pool",
				type: "address"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "tokenId",
						type: "uint256"
					},
					{
						internalType: "uint128",
						name: "liquidity",
						type: "uint128"
					},
					{
						internalType: "uint256",
						name: "amount0Min",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount1Min",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "deadline",
						type: "uint256"
					}
				],
				internalType: "struct INonfungiblePositionManager.DecreaseLiquidityParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "decreaseLiquidity",
		outputs: [
			{
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "getApproved",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "tokenId",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount0Desired",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount1Desired",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount0Min",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount1Min",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "deadline",
						type: "uint256"
					}
				],
				internalType: "struct INonfungiblePositionManager.IncreaseLiquidityParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "increaseLiquidity",
		outputs: [
			{
				internalType: "uint128",
				name: "liquidity",
				type: "uint128"
			},
			{
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "operator",
				type: "address"
			}
		],
		name: "isApprovedForAll",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "token0",
						type: "address"
					},
					{
						internalType: "address",
						name: "token1",
						type: "address"
					},
					{
						internalType: "uint24",
						name: "fee",
						type: "uint24"
					},
					{
						internalType: "int24",
						name: "tickLower",
						type: "int24"
					},
					{
						internalType: "int24",
						name: "tickUpper",
						type: "int24"
					},
					{
						internalType: "uint256",
						name: "amount0Desired",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount1Desired",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount0Min",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount1Min",
						type: "uint256"
					},
					{
						internalType: "address",
						name: "recipient",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "deadline",
						type: "uint256"
					}
				],
				internalType: "struct INonfungiblePositionManager.MintParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "mint",
		outputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				internalType: "uint128",
				name: "liquidity",
				type: "uint128"
			},
			{
				internalType: "uint256",
				name: "amount0",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			}
		],
		name: "multicall",
		outputs: [
			{
				internalType: "bytes[]",
				name: "results",
				type: "bytes[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "ownerOf",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "permit",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "positions",
		outputs: [
			{
				internalType: "uint96",
				name: "nonce",
				type: "uint96"
			},
			{
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				internalType: "address",
				name: "token0",
				type: "address"
			},
			{
				internalType: "address",
				name: "token1",
				type: "address"
			},
			{
				internalType: "uint24",
				name: "fee",
				type: "uint24"
			},
			{
				internalType: "int24",
				name: "tickLower",
				type: "int24"
			},
			{
				internalType: "int24",
				name: "tickUpper",
				type: "int24"
			},
			{
				internalType: "uint128",
				name: "liquidity",
				type: "uint128"
			},
			{
				internalType: "uint256",
				name: "feeGrowthInside0LastX128",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "feeGrowthInside1LastX128",
				type: "uint256"
			},
			{
				internalType: "uint128",
				name: "tokensOwed0",
				type: "uint128"
			},
			{
				internalType: "uint128",
				name: "tokensOwed1",
				type: "uint128"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "refundETH",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "safeTransferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "_data",
				type: "bytes"
			}
		],
		name: "safeTransferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermit",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "nonce",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "expiry",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermitAllowed",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "nonce",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "expiry",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermitAllowedIfNecessary",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermitIfNecessary",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "setApprovalForAll",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceId",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			}
		],
		name: "sweepToken",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "index",
				type: "uint256"
			}
		],
		name: "tokenByIndex",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "index",
				type: "uint256"
			}
		],
		name: "tokenOfOwnerByIndex",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "tokenURI",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amount0Owed",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount1Owed",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "uniswapV3MintCallback",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			}
		],
		name: "unwrapWETH9",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		stateMutability: "payable",
		type: "receive"
	}
];

var SwapRouter02ABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "_factoryV2",
				type: "address"
			},
			{
				internalType: "address",
				name: "factoryV3",
				type: "address"
			},
			{
				internalType: "address",
				name: "_positionManager",
				type: "address"
			},
			{
				internalType: "address",
				name: "_WETH9",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		inputs: [
		],
		name: "WETH9",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "approveMax",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "approveMaxMinusOne",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "approveZeroThenMax",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			}
		],
		name: "approveZeroThenMaxMinusOne",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "callPositionManager",
		outputs: [
			{
				internalType: "bytes",
				name: "result",
				type: "bytes"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "paths",
				type: "bytes[]"
			},
			{
				internalType: "uint128[]",
				name: "amounts",
				type: "uint128[]"
			},
			{
				internalType: "uint24",
				name: "maximumTickDivergence",
				type: "uint24"
			},
			{
				internalType: "uint32",
				name: "secondsAgo",
				type: "uint32"
			}
		],
		name: "checkOracleSlippage",
		outputs: [
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "path",
				type: "bytes"
			},
			{
				internalType: "uint24",
				name: "maximumTickDivergence",
				type: "uint24"
			},
			{
				internalType: "uint32",
				name: "secondsAgo",
				type: "uint32"
			}
		],
		name: "checkOracleSlippage",
		outputs: [
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "bytes",
						name: "path",
						type: "bytes"
					},
					{
						internalType: "address",
						name: "recipient",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "amountIn",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amountOutMinimum",
						type: "uint256"
					}
				],
				internalType: "struct IV3SwapRouter.ExactInputParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "exactInput",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "tokenIn",
						type: "address"
					},
					{
						internalType: "address",
						name: "tokenOut",
						type: "address"
					},
					{
						internalType: "uint24",
						name: "fee",
						type: "uint24"
					},
					{
						internalType: "address",
						name: "recipient",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "amountIn",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amountOutMinimum",
						type: "uint256"
					},
					{
						internalType: "uint160",
						name: "sqrtPriceLimitX96",
						type: "uint160"
					}
				],
				internalType: "struct IV3SwapRouter.ExactInputSingleParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "exactInputSingle",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "bytes",
						name: "path",
						type: "bytes"
					},
					{
						internalType: "address",
						name: "recipient",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "amountOut",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amountInMaximum",
						type: "uint256"
					}
				],
				internalType: "struct IV3SwapRouter.ExactOutputParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "exactOutput",
		outputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "tokenIn",
						type: "address"
					},
					{
						internalType: "address",
						name: "tokenOut",
						type: "address"
					},
					{
						internalType: "uint24",
						name: "fee",
						type: "uint24"
					},
					{
						internalType: "address",
						name: "recipient",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "amountOut",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amountInMaximum",
						type: "uint256"
					},
					{
						internalType: "uint160",
						name: "sqrtPriceLimitX96",
						type: "uint160"
					}
				],
				internalType: "struct IV3SwapRouter.ExactOutputSingleParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "exactOutputSingle",
		outputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factory",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "factoryV2",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "getApprovalType",
		outputs: [
			{
				internalType: "enum IApproveAndCall.ApprovalType",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "token0",
						type: "address"
					},
					{
						internalType: "address",
						name: "token1",
						type: "address"
					},
					{
						internalType: "uint256",
						name: "tokenId",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount0Min",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount1Min",
						type: "uint256"
					}
				],
				internalType: "struct IApproveAndCall.IncreaseLiquidityParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "increaseLiquidity",
		outputs: [
			{
				internalType: "bytes",
				name: "result",
				type: "bytes"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "token0",
						type: "address"
					},
					{
						internalType: "address",
						name: "token1",
						type: "address"
					},
					{
						internalType: "uint24",
						name: "fee",
						type: "uint24"
					},
					{
						internalType: "int24",
						name: "tickLower",
						type: "int24"
					},
					{
						internalType: "int24",
						name: "tickUpper",
						type: "int24"
					},
					{
						internalType: "uint256",
						name: "amount0Min",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "amount1Min",
						type: "uint256"
					},
					{
						internalType: "address",
						name: "recipient",
						type: "address"
					}
				],
				internalType: "struct IApproveAndCall.MintParams",
				name: "params",
				type: "tuple"
			}
		],
		name: "mint",
		outputs: [
			{
				internalType: "bytes",
				name: "result",
				type: "bytes"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "previousBlockhash",
				type: "bytes32"
			},
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			}
		],
		name: "multicall",
		outputs: [
			{
				internalType: "bytes[]",
				name: "",
				type: "bytes[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			}
		],
		name: "multicall",
		outputs: [
			{
				internalType: "bytes[]",
				name: "",
				type: "bytes[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			}
		],
		name: "multicall",
		outputs: [
			{
				internalType: "bytes[]",
				name: "results",
				type: "bytes[]"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "positionManager",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "pull",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "refundETH",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermit",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "nonce",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "expiry",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermitAllowed",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "nonce",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "expiry",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermitAllowedIfNecessary",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "selfPermitIfNecessary",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountOutMin",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "swapExactTokensForTokens",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amountInMax",
				type: "uint256"
			},
			{
				internalType: "address[]",
				name: "path",
				type: "address[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			}
		],
		name: "swapTokensForExactTokens",
		outputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			}
		],
		name: "sweepToken",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			}
		],
		name: "sweepToken",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "feeBips",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "feeRecipient",
				type: "address"
			}
		],
		name: "sweepTokenWithFee",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "feeBips",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "feeRecipient",
				type: "address"
			}
		],
		name: "sweepTokenWithFee",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "int256",
				name: "amount0Delta",
				type: "int256"
			},
			{
				internalType: "int256",
				name: "amount1Delta",
				type: "int256"
			},
			{
				internalType: "bytes",
				name: "_data",
				type: "bytes"
			}
		],
		name: "uniswapV3SwapCallback",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			}
		],
		name: "unwrapWETH9",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			}
		],
		name: "unwrapWETH9",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "recipient",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "feeBips",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "feeRecipient",
				type: "address"
			}
		],
		name: "unwrapWETH9WithFee",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountMinimum",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "feeBips",
				type: "uint256"
			},
			{
				internalType: "address",
				name: "feeRecipient",
				type: "address"
			}
		],
		name: "unwrapWETH9WithFee",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "wrapETH",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		stateMutability: "payable",
		type: "receive"
	}
];

IUniswapV3Factory.abi;
const IUniswapV3PoolABI = IUniswapV3Pool.abi;
var SupportedChainId;
(function (SupportedChainId) {
    SupportedChainId[SupportedChainId["MAINNET"] = 1] = "MAINNET";
    SupportedChainId[SupportedChainId["GOERLI"] = 5] = "GOERLI";
    SupportedChainId[SupportedChainId["MATIC"] = 137] = "MATIC";
    SupportedChainId[SupportedChainId["MUMBAI"] = 80001] = "MUMBAI";
})(SupportedChainId || (SupportedChainId = {}));
const FundManagerAddress = {
    [SupportedChainId.MAINNET]: '0x22fCce8f007D61AA933e29f6dDf756d73B6F39F1',
    [SupportedChainId.GOERLI]: '0xD64A92E7df4f7fdA24861f8C080b25E33649AF46',
    [SupportedChainId.MATIC]: '0xd974695B1ed124871cD85723fC5c9bD0201e5b71',
    [SupportedChainId.MUMBAI]: '0x856bE143e343DAf4BB40b48750938032B88079F6'
};
const FundProxyAddress = {
    [SupportedChainId.MAINNET]: '0x46274846AD09d8B82d42c89A7A01bE2d9d9a3121',
    [SupportedChainId.MATIC]: '0xa1E2F1123FCfd7FcC947bAaaBB7DD71EECaC2664',
    [SupportedChainId.GOERLI]: '0x1f5eB9b48d15d9692368312cE994590B286381Be',
    [SupportedChainId.MUMBAI]: '0xE4170E35b61BE7A7C1276c771aeB5F1C1454d002'
};
const FundViewerAddress = {
    [SupportedChainId.MAINNET]: '0x29BC2c2D717E0e712D7E64f6eC9C6586A41943a7',
    [SupportedChainId.GOERLI]: '0x0eE48757AC762Cd93eb7AC00bCe4eFa05DD21Eb3',
    [SupportedChainId.MATIC]: '0xafa23B0Ab912a2035BA9Abe6AC1Ab321809efE5D',
    [SupportedChainId.MUMBAI]: '0x6F3EaEc068a0f92Db9bcc7664B3F2776b3f463Ad'
};
const PathFinderAddress = {
    [SupportedChainId.MAINNET]: '0xef1C2f9532BdBBbaE8Ed22ABAB24Ac98F9513e67',
    [SupportedChainId.GOERLI]: '0x5681C896d42C57981Fb7990a0315fA2226aaC149',
    [SupportedChainId.MATIC]: '0x0f0d265C69E5eEe7e903dAB60b6a4753Ae8f2C63',
    [SupportedChainId.MUMBAI]: '0xb20d7e3EFF4985bEdC2c37294BcEa6D3F28daC8f'
};
const SwapRouter02Address = {
    [SupportedChainId.MAINNET]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    [SupportedChainId.GOERLI]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    [SupportedChainId.MATIC]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    [SupportedChainId.MUMBAI]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
};
const NonfungiblePositionManagerAddress = {
    [SupportedChainId.MAINNET]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    [SupportedChainId.GOERLI]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    [SupportedChainId.MATIC]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    [SupportedChainId.MUMBAI]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
};

const useToken = (chainId, addressOrSymbol) => {
    return new tokenList.TokenList(chainId).token(addressOrSymbol);
};

const NativeETHAddress = '0x0000000000000000000000000000000000000002';
const WethAddress = {
    [SupportedChainId.MAINNET]: useToken(SupportedChainId.MAINNET, 'WETH')
        .address,
    [SupportedChainId.GOERLI]: useToken(SupportedChainId.GOERLI, 'WETH').address,
    [SupportedChainId.MATIC]: useToken(SupportedChainId.MATIC, 'WMATIC').address,
    [SupportedChainId.MUMBAI]: useToken(SupportedChainId.MUMBAI, 'WMATIC').address
};

const isAddress = (value) => {
    try {
        return utils.getAddress(value) !== null;
    }
    catch {
        return false;
    }
};
const isEqualAddress = (address1, address2) => {
    return (isAddress(address1) &&
        isAddress(address2) &&
        utils.getAddress(address1) === utils.getAddress(address2));
};
const formatDetailData = (data) => {
    if (!data)
        return;
    if (typeof data === 'string' || typeof data === 'number')
        return data;
    if (data instanceof ethers.BigNumber)
        return data.toString();
    if (data instanceof Array && data.length === 0)
        return data;
    const keys = Object.keys(data);
    if (keys.length === 0)
        return data;
    const params = {};
    for (let i = 0; i < Object.keys(data).length; i++) {
        if (!isNaN(parseInt(keys[i])))
            continue;
        switch (true) {
            case data[keys[i]] instanceof ethers.BigNumber:
                params[keys[i]] = data[keys[i]].toString();
                break;
            case data[keys[i]] instanceof Array:
                const isRealHash = Object.keys(data[keys[i]]).find((key) => {
                    return isNaN(parseInt(key));
                });
                if (isRealHash) {
                    params[keys[i]] = formatDetailData(data[keys[i]]);
                }
                else {
                    const arrayData = [];
                    for (let j = 0; j < data[keys[i]].length; j++) {
                        arrayData.push(formatDetailData(data[keys[i]][j]));
                    }
                    params[keys[i]] = arrayData;
                }
                break;
            default:
                params[keys[i]] = data[keys[i]];
        }
    }
    return params;
};
const FEE_SIZE$1 = 3;
function encodePath$1(path, fees) {
    if (path.length != fees.length + 1) {
        throw new Error('path/fee lengths do not match');
    }
    let encoded = '0x';
    for (let i = 0; i < fees.length; i++) {
        // 20 byte encoding of the address
        encoded += path[i].slice(2);
        // 3 byte encoding of the fee
        encoded += fees[i].toString(16).padStart(2 * FEE_SIZE$1, '0');
    }
    // encode the final token
    encoded += path[path.length - 1].slice(2);
    return encoded.toLowerCase();
}
// Merge ETH balance to WETH & remove ETH from list
function mergedTokenBalances(chainId, tokenBalances) {
    const ethBalance = tokenBalances.find((item) => isEqualAddress(item.token, ethers.ethers.constants.AddressZero));
    const wethBalance = Object.assign({}, tokenBalances.find((item) => isEqualAddress(item.token, WethAddress[chainId])));
    if (ethBalance && wethBalance) {
        wethBalance.balance = wethBalance.balance.add(ethBalance.balance);
        wethBalance.value = wethBalance.value.add(ethBalance.value);
    }
    const otherTokens = tokenBalances.filter((item) => !isEqualAddress(item.token, ethers.ethers.constants.AddressZero) &&
        !isEqualAddress(item.token, WethAddress[chainId]));
    if (wethBalance) {
        return [...otherTokens, wethBalance];
    }
    return otherTokens;
}

const pathFinderContract = (chainId, provider) => {
    return useContract(PathFinderAddress[chainId], PathFinderABI, provider);
};
const exactInputPath = async (tokenIn, tokenOut, amount, chainId, provider) => {
    return await pathFinderContract(chainId, provider).callStatic.exactInputPath(tokenIn, tokenOut, amount);
};
const exactOutputPath = async (tokenIn, tokenOut, amount, chainId, provider) => {
    return await pathFinderContract(chainId, provider).callStatic.exactOutputPath(tokenIn, tokenOut, amount);
};
const fallbackPath = (token0, token1, chainId) => {
    const weth = WethAddress[chainId];
    if (isEqualAddress(token0, weth) || isEqualAddress(weth, token1)) {
        return encodePath([token0, token1], [v3Sdk.FeeAmount.MEDIUM]);
    }
    else {
        return encodePath([token0, weth, token1], [v3Sdk.FeeAmount.MEDIUM, v3Sdk.FeeAmount.MEDIUM]);
    }
};
const FEE_SIZE = 3;
const encodePath = (path, fees) => {
    if (path.length != fees.length + 1) {
        throw new Error('path/fee lengths do not match');
    }
    let encoded = '0x';
    for (let i = 0; i < fees.length; i++) {
        // 20 byte encoding of the address
        encoded += path[i].slice(2);
        // 3 byte encoding of the fee
        encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0');
    }
    // encode the final token
    encoded += path[path.length - 1].slice(2);
    return encoded.toLowerCase();
};

const executeSwap = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const wethAddress = WethAddress[chainId];
    const ethAmount = calcEthAmount$1(params, wethAddress);
    const swapRouter02Address = SwapRouter02Address[chainId];
    try {
        const calldata = await swapCalldata(chainId, signer, fundAddress, params, wethAddress);
        return await new Fund(chainId, signer, fundAddress).executeOrder(swapRouter02Address, calldata, ethAmount, maker, refundGas, overrides);
    }
    catch (e) {
        throw e;
    }
};
const swapCalldata = async (chainId, signer, fundAddress, params, wethAddress) => {
    switch (params.opType) {
        case 'exactInput':
            return await exactInputCalldata(chainId, signer, params, fundAddress, wethAddress);
        case 'exactOutput':
            return await exactOutPutCalldata(chainId, signer, params, fundAddress, wethAddress);
        default:
            throw new Error(`Invalid opType: ${params.opType}`);
    }
};
const exactInputCalldata = async (chainId, signer, params, fundAddress, wethAddress) => {
    if (!params.amountIn)
        throw new Error('Invalid amountIn');
    const trade = await exactInputPath(params.tokenIn, params.tokenOut, params.amountIn, chainId, signer);
    const swapParams = {
        recipient: calcRecipient(params, fundAddress, wethAddress),
        path: trade.path,
        amountIn: params.amountIn,
        amountOutMinimum: calcAmountOutMinimum(trade.expectedAmount, params.slippage)
    };
    const calldata = useEncodeFuncData(SwapRouter02ABI, 'exactInput', [
        swapParams
    ]);
    if (!params.useNative)
        return calldata;
    if (!isEqualAddress(params.tokenOut, wethAddress))
        return calldata;
    const unwrap = useEncodeFuncData(SwapRouter02ABI, 'unwrapWETH9(uint256,address)', [params.amountOut, fundAddress]);
    return useEncodeFuncData(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
        params.expiration,
        [calldata, unwrap]
    ]);
};
const exactOutPutCalldata = async (chainId, signer, params, fundAddress, wethAddress) => {
    if (!params.amountOut)
        throw new Error('Invalid amountOut');
    const trade = await exactOutputPath(params.tokenIn, params.tokenOut, params.amountOut, chainId, signer);
    const swapParams = {
        recipient: calcRecipient(params, fundAddress, wethAddress),
        path: trade.path,
        amountOut: params.amountOut,
        amountInMaximum: calcAmountInMaximum(trade.expectedAmount, params.slippage)
    };
    const output = useEncodeFuncData(SwapRouter02ABI, 'exactOutput', [
        swapParams
    ]);
    if (!params.useNative)
        return output;
    switch (true) {
        case isEqualAddress(params.tokenIn, wethAddress):
            const refund = useEncodeFuncData(SwapRouter02ABI, 'refundETH()', []);
            return useEncodeFuncData(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
                params.expiration,
                [output, refund]
            ]);
        case isEqualAddress(params.tokenOut, wethAddress):
            const unwrap = useEncodeFuncData(SwapRouter02ABI, 'unwrapWETH9(uint256,address)', [params.amountOut, fundAddress]);
            return useEncodeFuncData(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
                params.expiration,
                [output, unwrap]
            ]);
        default:
            return output;
    }
};
const swapMulticallCalldata = async (chainId, signer, maker, fundAddress, params, refundGas = false) => {
    const wethAddress = WethAddress[chainId];
    const ethAmount = calcEthAmount$1(params, wethAddress);
    const swapRouter02Address = SwapRouter02Address[chainId];
    try {
        const calldata = await swapCalldata(chainId, signer, fundAddress, params, wethAddress);
        return new Fund(chainId, signer, fundAddress).executeOrderCallData(swapRouter02Address, calldata, ethAmount, maker, refundGas);
    }
    catch (e) {
        throw e;
    }
};
/*
 * helper methods
 */
const calcEthAmount$1 = (params, wethAddress) => {
    if (!params.useNative)
        return ethers.constants.Zero;
    if (!isEqualAddress(params.tokenIn, wethAddress))
        return ethers.constants.Zero;
    return params.amountIn;
};
const calcRecipient = (params, recipient, wethAddress) => {
    if (!params.useNative)
        return recipient;
    if (!isEqualAddress(params.tokenOut, wethAddress))
        return recipient;
    return NativeETHAddress;
};
const calcAmountInMaximum = (expectedAmount, slippage) => {
    return expectedAmount
        .mul(ethers.BigNumber.from(1e4).add(ethers.BigNumber.from(slippage * 100)))
        .div(ethers.BigNumber.from(1e4));
};
const calcAmountOutMinimum = (expectedAmount, slippage) => {
    return expectedAmount
        .mul(ethers.BigNumber.from(1e4))
        .div(ethers.BigNumber.from(1e4).add(ethers.BigNumber.from(slippage * 100)));
};

const approveToken = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    try {
        const calldata = await approveTokenCalldata(chainId, signer, fundAddress, params);
        // if calldata is blank, no need approve
        if (!calldata)
            return [];
        return await new Fund(chainId, signer, fundAddress).executeOrder(params.token, calldata, ethers.constants.Zero, maker, refundGas, overrides);
    }
    catch (e) {
        throw e;
    }
};
const approveTokenCalldata = async (chainId, signer, fundAddress, params) => {
    try {
        // approve amount, default is constants.MaxUint256
        const amount = params.amount || ethers.constants.MaxUint256;
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
    return new Fund(chainId, signer, fundAddress).executeOrderCallData(params.token, calldata, ethers.constants.Zero, maker, refundGas);
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

const addLiquidity = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const executeParams = await addLiquidityMulticallDatacall(chainId, signer, maker, fundAddress, params, refundGas);
    return await new Fund(chainId, signer, fundAddress).executeMulticall(executeParams, overrides);
};
const addLiquidityCalldata = async (chainId, signer, params, fundAddress) => {
    const token0 = useToken(chainId, params.tokenA);
    const token1 = useToken(chainId, params.tokenB);
    const tokenA = new sdkCore.Token(chainId, token0.address, token0.decimals);
    const tokenB = new sdkCore.Token(chainId, token1.address, token1.decimals);
    if (!(tokenA && tokenB))
        throw new Error('Invalid token');
    const amountA = ethers.BigNumber.from(params.amountA);
    const amountB = ethers.BigNumber.from(params.amountB);
    const fee = params.fee;
    if (!Object.values(v3Sdk.FeeAmount).includes(fee))
        throw new Error('Invalid fee');
    const poolAddress = getPoolAddress(chainId, tokenA, tokenB, fee);
    if (!poolAddress)
        throw new Error('Invalid pool address');
    const poolContract = useContract(poolAddress, IUniswapV3PoolABI, signer);
    const slot0 = await poolContract.slot0();
    const currentTick = slot0.tick;
    const currentLiquidity = await poolContract.liquidity();
    let tickLower = params.lowerTick;
    if (!tickLower && params.lowerPrice) {
        const lowerPriceInFraction = mathjs.fraction(params.lowerPrice);
        tickLower = v3Sdk.nearestUsableTick(v3Sdk.priceToClosestTick(new sdkCore.Price(tokenA, tokenB, utils.parseUnits(lowerPriceInFraction.d.toString(), token0.decimals).toString(), utils.parseUnits(lowerPriceInFraction.n.toString(), token1.decimals).toString())), v3Sdk.TICK_SPACINGS[fee]);
    }
    let tickUpper = params.upperTick;
    if (!tickUpper && params.upperPrice) {
        const upperPriceInFraction = mathjs.fraction(params.upperPrice);
        tickUpper = v3Sdk.nearestUsableTick(v3Sdk.priceToClosestTick(new sdkCore.Price(tokenA, tokenB, utils.parseUnits(upperPriceInFraction.d.toString(), token0.decimals).toString(), utils.parseUnits(upperPriceInFraction.n.toString(), token1.decimals).toString())), v3Sdk.TICK_SPACINGS[fee]);
    }
    if (!(tickLower && tickUpper))
        throw new Error('Invalid ticker or price');
    const currentSqrtRatioX96 = v3Sdk.TickMath.getSqrtRatioAtTick(currentTick);
    const pool = new v3Sdk.Pool(tokenA, tokenB, fee, currentSqrtRatioX96, currentLiquidity, currentTick);
    const positionToMint = v3Sdk.Position.fromAmounts({
        pool,
        tickLower,
        tickUpper,
        amount0: amountA.toString(),
        amount1: amountB.toString(),
        useFullPrecision: true
    });
    let options;
    if (params.tokenId) {
        options = {
            tokenId: params.tokenId,
            slippageTolerance: new sdkCore.Percent(1, 100),
            deadline: params.expiration || new Date().getTime() / 1000 + 10 * 60
        };
    }
    else {
        options = {
            recipient: fundAddress,
            slippageTolerance: new sdkCore.Percent(1, 100),
            deadline: params.expiration || new Date().getTime() / 1000 + 10 * 60
        };
    }
    if (params.useNative) {
        options.useNative = sdkCore.Ether.onChain(chainId);
    }
    const { calldata } = v3Sdk.NonfungiblePositionManager.addCallParameters(positionToMint, options);
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
    return await new Fund(chainId, signer, fundAddress).executeOrder(nonfungiblePositionManagerAddress, calldata, ethers.constants.Zero, maker, refundGas, overrides);
};
const removeLiquidityMulticallCalldata = async (chainId, signer, maker, fundAddress, params, refundGas) => {
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const calldata = await removeLiquidityCalldata(chainId, signer, params, fundAddress);
    return new Fund(chainId, signer, fundAddress).executeOrderCallData(nonfungiblePositionManagerAddress, calldata, ethers.constants.Zero, maker, refundGas);
};
const removeLiquidityCalldata = async (chainId, signer, params, fundAddress) => {
    const token0 = useToken(chainId, params.tokenA);
    const token1 = useToken(chainId, params.tokenB);
    const tokenA = new sdkCore.Token(chainId, token0.address, token0.decimals);
    const tokenB = new sdkCore.Token(chainId, token1.address, token1.decimals);
    if (!(tokenA && tokenB))
        throw new Error('Invalid token');
    const wethAddress = WethAddress[chainId];
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const fee = Number(params.fee);
    if (!Object.values(v3Sdk.FeeAmount).includes(fee))
        throw new Error('Invalid fee');
    const poolAddress = getPoolAddress(chainId, tokenA, tokenB, fee);
    if (!poolAddress)
        throw new Error('Invalid pool address');
    const poolContract = useContract(poolAddress, IUniswapV3PoolABI, signer);
    const slot0 = await poolContract.slot0();
    const currentTick = slot0.tick;
    const currentLiquidity = await poolContract.liquidity();
    const currentSqrtRatioX96 = v3Sdk.TickMath.getSqrtRatioAtTick(currentTick);
    const positionData = await useContract(nonfungiblePositionManagerAddress, NonfungiblePositionManagerABI, signer).positions(ethers.BigNumber.from(params.tokenId));
    const pool = new v3Sdk.Pool(tokenA, tokenB, fee, currentSqrtRatioX96, currentLiquidity, currentTick);
    const position = new v3Sdk.Position({
        pool,
        tickLower: positionData.tickLower,
        tickUpper: positionData.tickUpper,
        liquidity: positionData.liquidity
    });
    const { calldata } = v3Sdk.NonfungiblePositionManager.removeCallParameters(position, {
        tokenId: params.tokenId,
        liquidityPercentage: new sdkCore.Percent(params.percent || 100, 100),
        slippageTolerance: new sdkCore.Percent(1, 100),
        deadline: Math.round(Date.now() / 1000) + 1800,
        collectOptions: {
            expectedCurrencyOwed0: sdkCore.CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenA, wethAddress)
                ? sdkCore.Ether.onChain(chainId)
                : tokenA, 0),
            expectedCurrencyOwed1: sdkCore.CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenB, wethAddress)
                ? sdkCore.Ether.onChain(chainId)
                : tokenB, 0),
            recipient: fundAddress
        }
    });
    return calldata;
};
const collectFee = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    const calldata = await collectFeeCalldata(chainId, params, fundAddress);
    return await new Fund(chainId, signer, fundAddress).executeOrder(nonfungiblePositionManagerAddress, calldata, ethers.constants.Zero, maker, refundGas, overrides);
};
const collectFeeCalldata = async (chainId, params, fundAddress) => {
    const token0 = useToken(chainId, params.tokenA);
    const token1 = useToken(chainId, params.tokenB);
    const tokenA = new sdkCore.Token(chainId, token0.address, token0.decimals);
    const tokenB = new sdkCore.Token(chainId, token1.address, token1.decimals);
    if (!(tokenA && tokenB))
        throw new Error('Invalid token');
    const wethAddress = WethAddress[chainId];
    const fee = Number(params.fee);
    if (!Object.values(v3Sdk.FeeAmount).includes(fee))
        throw new Error('Invalid fee');
    const poolAddress = getPoolAddress(chainId, tokenA, tokenB, fee);
    if (!poolAddress)
        throw new Error('Invalid pool address');
    const { calldata } = v3Sdk.NonfungiblePositionManager.collectCallParameters({
        tokenId: params.tokenId,
        expectedCurrencyOwed0: sdkCore.CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenA, wethAddress)
            ? sdkCore.Ether.onChain(chainId)
            : tokenA, 0),
        expectedCurrencyOwed1: sdkCore.CurrencyAmount.fromRawAmount(isEqualAddress(params.tokenB, wethAddress)
            ? sdkCore.Ether.onChain(chainId)
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
    const nonfungiblePositionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    return new Fund(chainId, signer, fundAddress).executeOrderCallData(nonfungiblePositionManagerAddress, calldata, ethAmount, maker, refundGas);
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
        return ethers.constants.Zero;
    if (isEqualAddress(params.tokenA, wethAddress))
        return params.amountA;
    if (isEqualAddress(params.tokenB, wethAddress))
        return params.amountB;
    return ethers.constants.Zero;
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
/*
 * helper methods
 */
const getPoolAddress = (chainId, token0, token1, fee) => {
    const tokenA = new sdkCore.Token(chainId, token0.address, token0.decimals);
    const tokenB = new sdkCore.Token(chainId, token1.address, token1.decimals);
    return v3Sdk.computePoolAddress({
        factoryAddress: v3Sdk.FACTORY_ADDRESS,
        tokenA,
        tokenB,
        fee
    });
};

const sendTransaction = async (contractAddress, contractABI, functionFragment, params, overrides = {}, signer) => {
    try {
        const contract = useContract(contractAddress, contractABI, signer);
        if (!overrides.gasLimit) {
            const estimateGas = await contract.estimateGas[functionFragment](...params, overrides);
            overrides.gasLimit = estimateGas.mul(110).div(100);
        }
        return await contract[functionFragment](...params, overrides);
    }
    catch (e) {
        throw e;
    }
};
const getAddressFromSigner = async (signer) => {
    return await signer.getAddress();
};

const executeAssetsConvert = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const fundManagerAddress = FundManagerAddress[chainId];
    const convertParams = await getConvertParams(chainId, signer, fundAddress, params);
    const executeParams = [fundAddress, convertParams, refundGas];
    return await sendTransaction(fundManagerAddress, FundManagerABI, 'sellAssets', executeParams, overrides, signer);
};
const executeAssetsConvertWithSlippage = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const assets = await new Fund(chainId, signer, fundAddress).getFundAssets();
    const tokenIn = assets.tokenBalances.find((item) => isEqualAddress(item.token, params.tokenIn));
    if (!tokenIn)
        throw new Error('Invalid tokenIn');
    const amountIn = tokenIn.balance
        .mul(ethers.BigNumber.from(params.ratio))
        .div(ethers.BigNumber.from(1e4));
    const swapParams = {
        opType: 'exactInput',
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: amountIn,
        slippage: params.slippage,
        useNative: params.useNative,
        expiration: params.expiration
    };
    return await executeSwap(chainId, signer, maker, fundAddress, swapParams, refundGas, overrides);
};
/*
 * helper methods
 */
const getConvertParams = async (chainId, signer, fundAddress, params) => {
    let convertParams = {
        sellType: 1,
        fee: 3000,
        minPriority: ethers.BigNumber.from(0),
        lastRatio: ethers.BigNumber.from(0),
        underlying: params.tokenOut
    };
    const fundData = await new Fund(chainId, signer, fundAddress).getFunndInfo(true);
    const assets = [
        ...fundData.tokenBalances.filter((item) => !isEqualAddress(item.token, fundData.underlyingToken)),
        ...fundData.lpTokens.map((item) => ({
            ...item,
            value: item.amountValue0.add(item.amountValue1)
        }))
    ].sort((a, b) => b.priority.sub(a.priority));
    const tokenIn = fundData.tokenBalances.find((item) => isEqualAddress(item.token, params.tokenIn));
    if (tokenIn) {
        convertParams['selectPriority'] = [tokenIn.priority];
        convertParams['selectRatio'] = [params.ratio];
        const paths = [];
        for (let i = 0; i < fundData.allowedTokens.length; i++) {
            if (isEqualAddress(fundData.allowedTokens[i], tokenIn.token)) {
                const trade = await exactInputPath(params.tokenIn, params.tokenOut, tokenIn.balance
                    .mul(ethers.BigNumber.from(params.ratio))
                    .div(ethers.BigNumber.from(1e4)), chainId, signer);
                paths.push(trade.path);
            }
            else {
                paths.push('0x');
            }
        }
        convertParams['paths'] = paths;
        return convertParams;
    }
    const needValue = fundData.totalValue
        .mul(ethers.BigNumber.from(params.ratio))
        .div(ethers.BigNumber.from(1e4));
    const selectPriority = [];
    const selectRatio = [];
    let selectedValue = ethers.constants.Zero;
    for (let i = 0; i < assets.length; i++) {
        selectPriority.push(assets[i].priority);
        if (selectedValue.gt(needValue)) {
            const leftValue = needValue.sub(selectedValue);
            const ratio = leftValue.mul(1000).div(assets[i].value);
            selectRatio.push(ratio);
            break;
        }
        else {
            selectRatio.push(1e4);
            selectedValue = selectedValue.add(assets[i].value);
        }
    }
    convertParams['selectPriority'] = selectPriority;
    convertParams['selectRatio'] = selectRatio;
    const balances = {};
    for (const asset of assets) {
        if (asset.token && asset.balance.eq(ethers.constants.Zero))
            continue;
        if (asset.tokenId &&
            asset.amount0.add(asset.fee0).eq(ethers.constants.Zero) &&
            asset.amount1.add(asset.fee1).eq(ethers.constants.Zero))
            continue;
        if (asset.token) {
            const amount = asset.balance
                .mul(params.lastRatio)
                .div(ethers.BigNumber.from(1e4));
            balances[asset.token] = balances[asset.token]
                ? balances[asset.token].add(amount)
                : amount;
        }
        else {
            const amount0 = asset.amount0
                .mul(params.lastRatio)
                .div(ethers.BigNumber.from(1e4));
            const amount1 = asset.amount1
                .mul(params.lastRatio)
                .div(ethers.BigNumber.from(1e4));
            balances[asset.token0] = (balances[asset.token0] ? balances[asset.token0].add(amount0) : amount0).add(asset.fee0);
            balances[asset.token1] = (balances[asset.token1] ? balances[asset.token1].add(amount1) : amount1).add(asset.fee1);
        }
    }
    const paths = [];
    for (const token of fundData.allowedTokens) {
        const balance = balances[token] || ethers.constants.Zero;
        if (balance.eq(ethers.constants.Zero) ||
            isEqualAddress(token, fundData.underlyingToken)) {
            paths.push('0x');
            continue;
        }
        const trade = await exactInputPath(token, fundData.underlyingToken, balance, chainId, signer);
        if (trade.path === '0x') {
            paths.push(fallbackPath(token, fundData.underlyingToken, chainId));
        }
        else {
            paths.push(trade.path);
        }
    }
    convertParams['paths'] = paths;
    return convertParams;
};

class Uniswap {
    chainId;
    signer;
    swapRouter02Address;
    positionManagerAddress;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        this.swapRouter02Address = SwapRouter02Address[chainId];
        this.positionManagerAddress = NonfungiblePositionManagerAddress[chainId];
    }
    async executeSwap(maker, fundAddress, params, refundGas, overrides) {
        params.expiration = this.executeExpiration(params);
        return await executeSwap(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
    }
    async executeLP(maker, fundAddress, params, refundGas, overrides) {
        params.expiration = this.executeExpiration(params);
        return await executeLP(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, refundGas, overrides) {
        params.expiration = this.executeExpiration(params);
        if (params.slippage) {
            return await executeAssetsConvertWithSlippage(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
        }
        else {
            return await executeAssetsConvert(this.chainId, this.signer, maker, fundAddress, params, refundGas, overrides);
        }
    }
    executeExpiration(params) {
        if (params.expiration)
            return params.expiration;
        return Math.round(new Date().getTime() / 1000 + 10 * 60);
    }
}

class Fund {
    chainId;
    signer;
    fundAddress;
    fundManagerAddress;
    fundProxyAddress;
    fundViewerAddress;
    mergePercentage = 102;
    constructor(chainId, signer, fundAddress) {
        this.chainId = chainId;
        this.signer = signer;
        this.fundAddress = fundAddress;
        this.fundManagerAddress = FundManagerAddress[chainId];
        this.fundProxyAddress = FundProxyAddress[chainId];
        this.fundViewerAddress = FundViewerAddress[chainId];
    }
    async getFunndInfo(withLP, lpAddress) {
        if (!lpAddress) {
            lpAddress = await this.signer.getAddress();
        }
        return await useContract(this.fundViewerAddress, FundViewerABI, this.signer).getFundData(this.fundAddress, lpAddress, withLP);
    }
    async getFundAssets() {
        const assets = await this.getFunndInfo(true);
        const tokenBalances = [];
        for (let i = 0; i < assets.tokenBalances.length; i++) {
            tokenBalances.push(formatDetailData(assets.tokenBalances[i]));
        }
        const lpTokens = [];
        for (let i = 0; i < assets.lpTokens.length; i++) {
            lpTokens.push(formatDetailData(assets.lpTokens[i]));
        }
        return { tokenBalances, lpTokens };
    }
    async executeSwap(maker, fundAddress, params, refundGas, overrides) {
        return await new Uniswap(this.chainId, this.signer).executeSwap(maker, fundAddress, params, refundGas, overrides);
    }
    async executeLP(maker, fundAddress, params, refundGas, overrides) {
        return await new Uniswap(this.chainId, this.signer).executeLP(maker, fundAddress, params, refundGas, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, refundGas, overrides) {
        return await new Uniswap(this.chainId, this.signer).executeAssetsConvert(maker, fundAddress, params, refundGas, overrides);
    }
    /*
     * helper methods
     */
    async executeOrder(target, calldata, ethAmount, maker, refundGas, overrides) {
        ethAmount ||= ethers.constants.Zero;
        maker ||= await getAddressFromSigner(this.signer);
        refundGas ||= false;
        const executeParams = [
            this.fundAddress,
            target,
            calldata,
            ethAmount,
            maker,
            refundGas
        ];
        return await sendTransaction(this.fundManagerAddress, FundManagerABI, 'executeOrder', executeParams, overrides, this.signer);
    }
    executeOrderCallData(target, calldata, ethAmount, maker, refundGas) {
        const executeParams = [
            this.fundAddress,
            target,
            calldata,
            ethAmount,
            maker,
            refundGas
        ];
        return useEncodeFuncData(FundManagerABI, 'executeOrder', executeParams);
    }
    async executeMulticall(executeParams, overrides) {
        return await sendTransaction(this.fundManagerAddress, FundManagerABI, 'multicall', [executeParams], overrides, this.signer);
    }
    executeMulticallCalldata() { }
    async executeApproveToken(params, maker, refundGas, overrides) {
        maker ||= await getAddressFromSigner(this.signer);
        return await approveToken(this.chainId, this.signer, maker, this.fundAddress, params, refundGas, overrides);
    }
    async executeBuyFund(amount, maker, overrides) {
        amount ||= ethers.constants.Zero;
        maker ||= await getAddressFromSigner(this.signer);
        const fundInfo = await this.getFunndInfo(true);
        if (WethAddress[this.chainId] === fundInfo.underlyingToken) {
            overrides ||= {};
            overrides.value = amount;
        }
        const executeParams = [this.fundAddress, amount];
        return await sendTransaction(this.fundManagerAddress, FundManagerABI, 'buy', executeParams, overrides, this.signer);
    }
    calculateAmountMargin(value) {
        return value.mul(this.mergePercentage).div(100);
    }
    fallbackPath(token0, token1) {
        const weth = WethAddress[this.chainId];
        if (isEqualAddress(token0, weth) || isEqualAddress(weth, token1)) {
            return encodePath$1([token0, token1], [v3Sdk.FeeAmount.MEDIUM]);
        }
        else {
            return encodePath$1([token0, weth, token1], [v3Sdk.FeeAmount.MEDIUM, v3Sdk.FeeAmount.MEDIUM]);
        }
    }
    async getSellParams(sellRatio) {
        const fund = await this.getFunndInfo(true);
        const targetAmount = this.calculateAmountMargin(fund.totalValue
            .mul(fund.callerDetail.totalUnit)
            .div(fund.totalUnit)
            .mul(sellRatio)
            .div(100));
        const underlyingToken = useToken(this.chainId, fund.underlyingToken);
        const decimals = underlyingToken.decimals;
        console.debug('=> target amount', ethers.utils.formatUnits(targetAmount, decimals), `(${this.mergePercentage}%)`);
        const tokenBalances = mergedTokenBalances(this.chainId, fund.tokenBalances);
        const underlyingTokenBalance = tokenBalances.find((item) => isEqualAddress(item.token, fund.underlyingToken));
        if (underlyingTokenBalance.balance.gte(targetAmount)) {
            return {
                sellType: ethers.constants.Zero,
                minPriority: ethers.constants.MaxUint256,
                lastRatio: targetAmount.mul(10000).div(underlyingTokenBalance.balance),
                selectPriority: [],
                selectRatio: [],
                underlying: fund.underlyingToken,
                paths: [],
                fee: 0
            };
        }
        const params = {
            sellType: ethers.constants.Zero,
            minPriority: ethers.constants.Zero,
            lastRatio: ethers.BigNumber.from(10000),
            selectPriority: [],
            selectRatio: [],
            underlying: fund.underlyingToken,
            paths: [],
            fee: 0
        };
        const assets = [
            ...tokenBalances.filter((item) => !isEqualAddress(item.token, fund.underlyingToken)),
            ...fund.lpTokens.map((item) => ({
                ...item,
                value: item.amountValue0.add(item.amountValue1)
            }))
        ].sort((a, b) => b.priority.sub(a.priority));
        const groupedAssets = [];
        assets.forEach((item) => {
            const lastGroup = groupedAssets.length > 0
                ? groupedAssets[groupedAssets.length - 1]
                : undefined;
            if (lastGroup && lastGroup.length > 0) {
                const lastItem = lastGroup[0];
                if (lastItem.priority.eq(item.priority)) {
                    groupedAssets[groupedAssets.length - 1] = [...lastGroup, item];
                }
                else {
                    groupedAssets.push([item]);
                }
            }
            else {
                groupedAssets.push([item]);
            }
        });
        let totalAssetAmount = ethers.constants.Zero;
        const assetSellAmount = targetAmount.sub(underlyingTokenBalance.balance);
        const balances = {};
        for (const group of groupedAssets) {
            const value = group.reduce((acc, cur) => {
                return acc.add(cur.value);
            }, ethers.constants.Zero);
            if (totalAssetAmount.add(value).gte(assetSellAmount)) {
                const lastAmount = assetSellAmount.sub(totalAssetAmount);
                params.lastRatio = lastAmount.mul(10000).div(value);
                params.minPriority = group[0].priority;
            }
            else {
                totalAssetAmount = totalAssetAmount.add(value);
            }
            for (const asset of group) {
                if (asset.token && asset.balance.eq(ethers.constants.Zero))
                    continue;
                if (asset.tokenId &&
                    asset.amount0.add(asset.fee0).eq(ethers.constants.Zero) &&
                    asset.amount1.add(asset.fee1).eq(ethers.constants.Zero))
                    continue;
                if (asset.token) {
                    const amount = asset.balance.mul(params.lastRatio).div(10000);
                    balances[asset.token] = balances[asset.token]
                        ? balances[asset.token].add(amount)
                        : amount;
                }
                else {
                    const amount0 = asset.amount0.mul(params.lastRatio).div(10000);
                    const amount1 = asset.amount1.mul(params.lastRatio).div(10000);
                    balances[asset.token0] = (balances[asset.token0]
                        ? balances[asset.token0].add(amount0)
                        : amount0).add(asset.fee0);
                    balances[asset.token1] = (balances[asset.token1]
                        ? balances[asset.token1].add(amount1)
                        : amount1).add(asset.fee1);
                }
            }
            if (params.minPriority.gt(ethers.constants.Zero))
                break;
        }
        const paths = [];
        for (const token of fund.allowedTokens) {
            const balance = balances[token] || ethers.constants.Zero;
            if (balance.eq(ethers.constants.Zero) ||
                isEqualAddress(token, fund.underlyingToken)) {
                paths.push('0x');
                continue;
            }
            const trade = await exactInputPath(token, fund.underlyingToken, balance, this.chainId, this.signer);
            if (trade.path === '0x') {
                paths.push(this.fallbackPath(token, fund.underlyingToken));
            }
            else {
                paths.push(trade.path);
            }
        }
        params.paths = paths;
        return params;
    }
    async executeSellFund(percentage, maker, overrides) {
        maker ||= await getAddressFromSigner(this.signer);
        const params = await this.getSellParams(percentage);
        try {
            return await sendTransaction(this.fundProxyAddress, FundProxyABI, 'sell', [this.fundAddress, maker, Math.round(percentage * 100), params], overrides, this.signer);
        }
        catch (e) {
            if (e.message.includes('FM31')) {
                // sell to litte
                this.mergePercentage += 1;
                return await this.executeSellFund(percentage, maker, overrides);
            }
            else if (e.message.includes('FM32')) {
                // sell to much
                this.mergePercentage -= 1;
                return await this.executeSellFund(percentage, maker, overrides);
            }
            else {
                throw e;
            }
        }
    }
}

exports.Role = void 0;
(function (Role) {
    Role[Role["MANAGER"] = 1] = "MANAGER";
    Role[Role["OPERATOR"] = 2] = "OPERATOR";
    Role[Role["INVESTOR"] = 3] = "INVESTOR";
    Role[Role["INVITED"] = 4] = "INVITED";
})(exports.Role || (exports.Role = {}));
class UniversalSDK {
    chainId;
    signer;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        if (!this.signer.provider)
            throw new Error('invalid signer or provider');
    }
    async getFundList(maker, role) {
        const viewr = useContract(FundViewerAddress[this.chainId], FundViewerABI, this.signer);
        return await viewr.getFundsData(maker, role, false);
    }
    async executeSwap(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeSwap(maker, fundAddress, params, refundGas, overrides);
    }
    async executeLP(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeLP(maker, fundAddress, params, refundGas, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeAssetsConvert(maker, fundAddress, params, refundGas, overrides);
    }
    async executeApproveToken(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeApproveToken(params, maker, refundGas, overrides);
    }
    async executeBuyFund(maker, fundAddress, amount, overrides) {
        return await this.fund(fundAddress).executeBuyFund(amount, maker, overrides);
    }
    async executeSellFund(maker, fundAddress, percentage, overrides) {
        return await this.fund(fundAddress).executeSellFund(percentage, maker, overrides);
    }
    async getFundInfo(fundAddress, lpAddress, withAssets = true) {
        return await this.fund(fundAddress).getFunndInfo(withAssets, lpAddress);
    }
    async getFundAssets(fundAddress) {
        return await this.fund(fundAddress).getFundAssets();
    }
    fund(fundAddress) {
        return new Fund(this.chainId, this.signer, fundAddress);
    }
}

exports.UniversalSDK = UniversalSDK;
