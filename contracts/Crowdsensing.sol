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

    event DataSubmitted(address indexed provider, string encryptedData);
    event DataVerified(address indexed provider, bool verified);

    constructor() {
        owner = msg.sender;
        dataCount = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Register a data provider
    function registerProvider(address provider) public onlyOwner {
        dataProviders[provider] = DataProvider(provider, "", false);
    }

    // Data providers submit encrypted data
    function submitData(string memory encryptedData) public {
        require(bytes(dataProviders[msg.sender].encryptedData).length == 0, "Data already submitted");
        dataProviders[msg.sender].encryptedData = encryptedData;
        dataCount++;
        emit DataSubmitted(msg.sender, encryptedData);
    }

    // Owner verifies the data
    function verifyData(address provider, bool isValid) public onlyOwner {
        require(bytes(dataProviders[provider].encryptedData).length != 0, "No data submitted");
        dataProviders[provider].verified = isValid;
        emit DataVerified(provider, isValid);
    }
}
