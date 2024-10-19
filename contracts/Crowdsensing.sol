// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdsensing {
    struct DataProvider {
        address provider;
        string encryptedData;
        bool verified;
    }

    address public owner;
    mapping(address => DataProvider) public dataProviders;
    uint public dataCount;
    string public encryptedSum;

    event DataSubmitted(address indexed provider, string encryptedData);
    event AggregationComplete(string encryptedSum);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function submitData(string memory encryptedData) public {
        require(
            bytes(dataProviders[msg.sender].encryptedData).length == 0,
            "Data already submitted"
        );
        dataProviders[msg.sender].encryptedData = encryptedData;
        dataCount++;
        emit DataSubmitted(msg.sender, encryptedData);
    }

    function aggregateEncryptedData(
        address[] memory providerAddresses
    ) public onlyOwner {
        require(providerAddresses.length > 0, "No provider addresses provided");

        for (uint i = 0; i < providerAddresses.length; i++) {
            address provider = providerAddresses[i];
            require(
                bytes(dataProviders[provider].encryptedData).length != 0,
                "Data not submitted"
            );

            encryptedSum = string(
                abi.encodePacked(
                    encryptedSum,
                    dataProviders[provider].encryptedData
                )
            );
        }

        emit AggregationComplete(encryptedSum);
    }

    // New function to reset provider data
    function resetProviderData(address provider) public onlyOwner {
        require(
            bytes(dataProviders[provider].encryptedData).length != 0,
            "No data to reset"
        );
        dataProviders[provider].encryptedData = "";
        dataCount--;
    }

    function registerProvider(address provider) public onlyOwner {
        require(provider != address(0), "Invalid address");
        require(
            bytes(dataProviders[provider].encryptedData).length == 0,
            "Provider already registered"
        );

        dataProviders[provider] = DataProvider(provider, "", false);
    }

    function getEncryptedSum() public view returns (string memory) {
        return encryptedSum;
    }
}
