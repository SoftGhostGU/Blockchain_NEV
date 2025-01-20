// SPDX-License-Identifier: NIT
pragma solidity ^0.8.26;

interface interfaceDriverOracleContract{
    function getLocation(address addr) external returns (uint);
    function setLocation(uint newLocation) external;
}

contract driverOracleContract is interfaceDriverOracleContract{
    mapping(address => uint) public driversLocation;

    function getLocation(address addr) external view override returns (uint) {
        return driversLocation[addr];
    }

    function setLocation(uint newLocation) external override{
        driversLocation[msg.sender] = newLocation;
    }
}