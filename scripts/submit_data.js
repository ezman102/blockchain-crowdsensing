const { exec } = require('child_process');
const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();

    console.log("Submitting encrypted data...");

    // Example data to be encrypted by Python script
    const plaintext = 25;

    exec(`python3 privacy/paillier_encryption.py ${plaintext}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Python script error: ${stderr}`);
        return;
      }

      const encryptedData = stdout.trim();
      console.log(`Encrypted Data: ${encryptedData}`);

      await crowdsensing.submitData(encryptedData, { from: accounts[0] });
      console.log(`Data submitted from ${accounts[0]}: ${encryptedData}`);
    });
  } catch (error) {
    console.error("Error submitting data:", error);
  }
  callback();
};
