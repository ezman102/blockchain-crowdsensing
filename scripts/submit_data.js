const fs = require('fs');
const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();

    console.log("Submitting encrypted data...");

    // Simulate different encrypted data for each participant
    const dataSamples = ["Temperature:25", "Humidity:40", "CO2:300"];

    for (let i = 0; i < dataSamples.length; i++) {
      const encryptedData = encryptData(dataSamples[i]);
      await crowdsensing.submitData(encryptedData, { from: accounts[i] });

      console.log(`Data submitted from ${accounts[i]}: ${dataSamples[i]}`);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }
  callback();
};

// Dummy encryption function
function encryptData(data) {
  return "0x" + Buffer.from(data).toString('hex');
}
