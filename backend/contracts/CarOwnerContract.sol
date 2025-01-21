// SPDX-License-Identifier: NIT
pragma solidity ^0.8.26;

contract CarOwnerContract {
    struct Driver {
        address addr;
        string username;
        uint registerTime;
        string teleNumber;
        uint[] taskIds;
        uint completedTaskNum;
        uint reputation;   
        bool online;
    }

    enum Status {
        Unclaimed,
        Claimed,
        ReachPickupLocation,
        ReachDropoffLocation,
        Completed
    }

    mapping(address => Driver) public driverList;
    address[] public driversAddress;

    function notRegistered(address addr) public view returns (bool) {
        return driverList[addr].addr > address(0) ? false : true;
    }

    function userRegister(address addr, string memory username, string memory teleNumber) public {
        require(notRegistered(addr));
        driverList[addr] = Driver(addr, username, block.timestamp, teleNumber, new uint[](0), 0, 60, false);
        driversAddress.push(addr);
    }

    function getDriverInfo(address addr) public view returns (address, string memory, uint, string memory, uint[] memory, uint, uint, bool) {
        require(driverList[addr].addr == addr);
        return (driverList[addr].addr, driverList[addr].username, driverList[addr].registerTime, driverList[addr].teleNumber, driverList[addr].taskIds, driverList[addr].completedTaskNum, driverList[addr].reputation, driverList[addr].online);
    }

    function updateUserInfo(address addr, string memory username, string memory teleNumber) public {
        require(addr == msg.sender);
        require(!notRegistered(addr));
        driverList[addr].username = username;
        driverList[addr].teleNumber = teleNumber;
    }

    function setDriverOnline(address addr, bool isOnline) public {
        require(addr == msg.sender);
        driverList[addr].online = isOnline;
    }

    function getReputation(address addr) public view returns (uint) {
        require(driverList[addr].addr == addr);
        return driverList[addr].reputation;
    }

    function parseLocation(uint location) public pure returns (int lgt, int lat){
        //location: 1 12140 1 03122
        //经纬度表示：符号 经度 符号 纬度（1表示正，2表示负） 
        int lgtHalf = int(location / 1000000);
        int latHalf = int(location % 1000000);
        lgt = lgtHalf / 100000 == 1 ? lgtHalf % 100000 : - (lgtHalf % 100000);
        lat = latHalf / 100000 == 1 ? latHalf % 100000 : - (latHalf % 100000);
        return (lgt, lat);
    }

    function EuclideanDistanceSquare(uint location1, uint location2) public pure returns (int){
        int lgt1;
        int lat1;
        int lgt2;
        int lat2;
        (lgt1, lat1) = parseLocation(location1);
        (lgt2, lat2) = parseLocation(location2);
        return (lgt1 - lgt2)**2 + (lat1 - lat2)**2;
    }
}
