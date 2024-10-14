const Crowdsensing = artifacts.require("Crowdsensing");

contract("Crowdsensing", accounts => {
  it("should register a data provider", async () => {
    const instance = await Crowdsensing.deployed();
    await instance.registerProvider(accounts[1]);
    const provider = await instance.dataProviders(accounts[1]);
    assert.equal(provider.provider, accounts[1], "Provider was not registered correctly");
  });

  it("should allow data submission", async () => {
    const instance = await Crowdsensing.deployed();
    await instance.submitData("0xEncryptedData", { from: accounts[1] });
    const provider = await instance.dataProviders(accounts[1]);
    assert.equal(provider.encryptedData, "0xEncryptedData", "Data was not submitted correctly");
  });
});
