// 2_deploy_crowdsensing.js
const Crowdsensing = artifacts.require("Crowdsensing");

module.exports = function (deployer) {
    deployer.deploy(Crowdsensing, { gas: 6721975 });
};
