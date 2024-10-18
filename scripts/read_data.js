const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    const submittedData = await crowdsensing.dataProviders(account);
    console.log(`Data for ${account}:`, submittedData.encryptedData);
  } catch (error) {
    console.error("Error reading data:", error);
  }
  callback();
};
