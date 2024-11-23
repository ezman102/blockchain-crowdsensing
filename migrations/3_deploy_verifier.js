// 3_deploy_verifier.js (Future Improve on Clain)
const Groth16Verifier = artifacts.require("Groth16Verifier");

module.exports = function (deployer) {
    deployer.deploy(Groth16Verifier);
};
