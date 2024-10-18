const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();

    console.log("Using owner account:", accounts[0]);

    // Pass the array of provider addresses
    const providerAddresses = [
      accounts[0],
      accounts[1],
      accounts[2]
    ];

    await crowdsensing.aggregateEncryptedData(providerAddresses, { from: accounts[0] });

    const aggregatedSum = await crowdsensing.getEncryptedSum();
    console.log("Aggregated Encrypted Sum:", aggregatedSum);
  } catch (error) {
    console.error("Error aggregating data:", error);
  }
  callback();
};
