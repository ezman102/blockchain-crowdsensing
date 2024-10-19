const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();

    console.log("Registering providers...");
    for (const account of accounts) {
      await crowdsensing.registerProvider(account, { from: accounts[0] });
      console.log(`Registered provider: ${account}`);
    }
  } catch (error) {
    console.error("Error registering providers:", error);
  }
  callback();
};
