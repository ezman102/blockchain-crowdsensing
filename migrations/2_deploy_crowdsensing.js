const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = function (deployer) {
    // Deploy the Crowdsensing contract with an increased gas limit
    deployer.deploy(Crowdsensing, { gas: 6721975 });
};
