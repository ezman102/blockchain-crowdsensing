// SPDX-License-Identifier: MIT
// Crowdsensing.sol
pragma solidity ^0.8.0;

contract Crowdsensing {
    struct DataProvider {
        address provider;
        string[] encryptedData; 
        bool verified;
    }

    address public owner;
    mapping(address => DataProvider) public dataProviders;
    uint public dataCount;
    string public lastAggregatedSum;  

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
        if (dataProviders[msg.sender].provider == address(0)) {
            dataProviders[msg.sender].provider = msg.sender;
        }
        dataProviders[msg.sender].encryptedData.push(encryptedData);
        dataCount++;
        emit DataSubmitted(msg.sender, encryptedData);
    }

    function aggregateEncryptedData(
        address[] memory providerAddresses
    ) public onlyOwner returns (string memory) {
        require(providerAddresses.length > 0, "No provider addresses provided");

        string memory encryptedSum;
        for (uint i = 0; i < providerAddresses.length; i++) {
            address provider = providerAddresses[i];
            require(
                dataProviders[provider].encryptedData.length > 0,
                "No data submitted"
            );
            for (uint j = 0; j < dataProviders[provider].encryptedData.length; j++) {
                encryptedSum = string(
                    abi.encodePacked(
                        encryptedSum,
                        dataProviders[provider].encryptedData[j]
                    )
                );
            }
        }
        lastAggregatedSum = encryptedSum;
        emit AggregationComplete(encryptedSum);
        return encryptedSum;
    }

    function getLastAggregatedSum() public view returns (string memory) {
        return lastAggregatedSum;
    }
}
