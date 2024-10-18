const fs = require('fs');
const Crowdsensing = artifacts.require("Crowdsensing");
const { exec } = require('child_process');

module.exports = async function (callback) {
  try {
    const crowdsensing = await Crowdsensing.deployed();
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    // Read data from the file
    const data = fs.readFileSync('./data/data.txt', 'utf8').split('\n');

    for (let i = 0; i < data.length; i++) {
      const plaintextData = data[i].trim();
      if (plaintextData) {
        // Call the Python encryption script with the plaintext data
        exec(`python3 ./privacy/paillier_encryption.py ${plaintextData}`, async (err, stdout, stderr) => {
          if (err) {
            console.error(`Error executing Python script: ${err.message}`);
            return;
          }

          const encryptedData = stdout.trim();  // Capture the encrypted data

          // Submit encrypted data to the smart contract
          await crowdsensing.submitData(encryptedData, { from: account });
          console.log(`Data submitted successfully from ${account}: ${plaintextData}`);
        });
      }
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }
  callback();
};
