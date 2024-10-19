// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdsensing {
    struct DataEntry {
        string encryptedData;
        uint256 timestamp; // Store the timestamp of the submission
    }

    struct DataProvider {
        address provider;
        DataEntry[] submissions; // Store multiple submissions with timestamps
        bool verified;
    }

    address public owner;
    mapping(address => DataProvider) public dataProviders;
    uint public dataCount;

    event DataSubmitted(address indexed provider, string encryptedData, uint256 timestamp);
    event AggregationComplete(string encryptedSum);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function submitData(string memory encryptedData) public {
        // If the provider is submitting for the first time, initialize their data
        if (dataProviders[msg.sender].provider == address(0)) {
            dataProviders[msg.sender].provider = msg.sender;
        }

        // Add the new encrypted data with a timestamp
        dataProviders[msg.sender].submissions.push(
            DataEntry({encryptedData: encryptedData, timestamp: block.timestamp})
        );
        dataCount++;

        emit DataSubmitted(msg.sender, encryptedData, block.timestamp);
    }

function aggregateEncryptedData(address[] memory providerAddresses) 
    public onlyOwner returns (string memory) {
    require(providerAddresses.length > 0, "No provider addresses provided");

    string memory encryptedSum;

    try {
        for (uint i = 0; i < providerAddresses.length; i++) {
            address provider = providerAddresses[i];
            require(dataProviders[provider].encryptedData.length > 0, "No data submitted");

            for (uint j = 0; j < dataProviders[provider].encryptedData.length; j++) {
                encryptedSum = string(
                    abi.encodePacked(
                        encryptedSum,
                        dataProviders[provider].encryptedData[j]
                    )
                );
            }
        }
    } catch (bytes memory error) {
        revert(string(abi.encodePacked("Aggregation failed: ", error)));
    }

    emit AggregationComplete(encryptedSum);
    return encryptedSum;
}


    function getProviderData(address provider) 
        public 
        view 
        returns (DataEntry[] memory) 
    {
        return dataProviders[provider].submissions;
    }
}
