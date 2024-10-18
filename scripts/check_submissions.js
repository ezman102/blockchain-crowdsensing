const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();

    console.log("Checking data submissions...");

    for (const account of accounts) {
      const providerData = await crowdsensing.dataProviders(account);
      console.log(`Account: ${account}, Data: ${providerData.encryptedData}`);
    }
  } catch (error) {
    console.error("Error checking data:", error);
  }
  callback();
};
