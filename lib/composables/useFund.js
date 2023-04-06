import { constants } from "ethers";
const getFundData = async (fundAddress, extend, lpAddress, provider, options = {}) => {
    lpAddress ||= constants.AddressZero;
    return await fundViewerContract(provider).getFundData(fundAddress, lpAddress, extend, options);
};
