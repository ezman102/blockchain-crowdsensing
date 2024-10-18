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

    function registerProvider(address provider) public onlyOwner {
        dataProviders[provider] = DataProvider(provider, "", false);
    }

    function submitData(string memory encryptedData) public {
        require(bytes(dataProviders[msg.sender].encryptedData).length == 0, "Data already submitted");
        dataProviders[msg.sender].encryptedData = encryptedData;
        dataCount++;
        emit DataSubmitted(msg.sender, encryptedData);
    }

    // Updated to accept an array of addresses
    function aggregateEncryptedData(address[] memory providerAddresses) public onlyOwner {
        for (uint i = 0; i < providerAddresses.length; i++) {
            address provider = providerAddresses[i];
            encryptedSum = string(abi.encodePacked(encryptedSum, dataProviders[provider].encryptedData));
        }
        emit AggregationComplete(encryptedSum);
    }

    function getEncryptedSum() public view returns (string memory) {
        return encryptedSum;
    }
}
