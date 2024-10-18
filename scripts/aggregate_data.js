const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = async function(callback) {
    const paillier = require('paillier-encryption-lib');
    const { exec } = require('child_process');

    try {
        const crowdsensing = await Crowdsensing.deployed();
        const accounts = await web3.eth.getAccounts();

        // Aggregate encrypted data (from the blockchain)
        const encryptedSum = await crowdsensing.getEncryptedSum();  // Assuming contract has this function

        // Decrypt aggregated sum using Python script
        exec(`python3 ./privacy/paillier_encryption.py ${encryptedSum}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing Python script: ${err}`);
                return;
            }
            const decryptedSum = stdout.trim();  // Get the decrypted data from Python script

            console.log(`Decrypted aggregated sum: ${decryptedSum}`);
            callback();
        });
    } catch (error) {
        console.error("Error aggregating data:", error);
        callback(error);
    }
};
