const fs = require('fs');
const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();

    for (let i = 0; i < accounts.length; i++) {
      const provider = await crowdsensing.dataProviders(accounts[i]);
      if (!provider.encryptedData) {
        const data = fs.readFileSync('./data/data.txt', 'utf8').split('\n');
        const plaintextData = data[i] ? data[i].trim() : null;

        if (plaintextData) {
          const encryptedData = encryptData(plaintextData); // Placeholder for encryption logic
          await crowdsensing.submitData(encryptedData, { from: accounts[i] });
          console.log(`Data submitted successfully from ${accounts[i]}: ${plaintextData}`);
        }
      } else {
        console.log(`Data already submitted for account ${accounts[i]}. Skipping...`);
      }
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
