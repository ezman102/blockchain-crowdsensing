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
    address[] public providerAddresses; // Array to store provider addresses
    uint public dataCount;
    string public encryptedSum;  // Store the encrypted aggregated sum

    event DataSubmitted(address indexed provider, string encryptedData);
    event AggregationComplete(string encryptedSum);

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
        providerAddresses.push(provider);  // Track provider address
    }

    // Submit encrypted data
    function submitData(string memory encryptedData) public {
        require(bytes(dataProviders[msg.sender].encryptedData).length == 0, "Data already submitted");
        dataProviders[msg.sender].encryptedData = encryptedData;
        dataCount++;
        emit DataSubmitted(msg.sender, encryptedData);
    }

    // Aggregate encrypted data (to be called after all submissions)
    function aggregateEncryptedData() public onlyOwner {
        encryptedSum = "";  // Reset encryptedSum before aggregation
        for (uint i = 0; i < providerAddresses.length; i++) {
            address provider = providerAddresses[i];
            encryptedSum = string(abi.encodePacked(encryptedSum, dataProviders[provider].encryptedData));
        }
        emit AggregationComplete(encryptedSum);
    }

    // Get the aggregated encrypted sum
    function getEncryptedSum() public view returns (string memory) {
        return encryptedSum;
    }
}
