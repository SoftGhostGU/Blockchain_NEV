// SPDX-License-Identifier: NIT
pragma solidity ^0.8.26;

import './CarOwnerContract.sol';
import "./interfaceDriverOracleContract.sol";

contract RideHailingContract is CarOwnerContract {
    struct Task {
        uint index; // start from 0
        address rider;
        uint pickupLocation;
        uint dropoffLocation;
        uint minReputation;
        uint reward; 
        uint deposit;
        address driver;
        Status status;
        uint farePerMile; // wei
        uint farawayCallFee;
        uint recommendWaitingTime; // minutes
        uint recommendTimeTaken; // minutes
        uint recommendDistanceTaken; // meters
        uint realWaitingTime; // minutes
        uint realTimeTaken; // minutes
        uint realDistanceTaken; // meters
        uint evaluationToDriver; // 1 to 10 
        uint tip;
    }

    struct Rider {
        address addr;
        string username;
        uint registerTime;
        string teleNumber;
        uint[] taskIds;
    }

    Task[] public taskList;
    mapping(address => Rider) riderList;
    interfaceDriverOracleContract private driverOracle; // 使用接口实例化 driverOracleAddress

    function publishTask(uint pickupLocation, uint dropoffLocation, uint minReputation, uint recommendWaitingTime, uint recommendTimeTaken, uint recommendDistanceTaken, uint farePerMile, uint farawayCallFee) public payable returns (uint _index) {
        uint deposit = (recommendDistanceTaken * farePerMile + farawayCallFee) * 2;
        require(msg.value >= deposit);
        taskList.push(Task(taskList.length, msg.sender, pickupLocation, dropoffLocation, minReputation, 0, deposit, address(0), Status.Unclaimed, farePerMile, farawayCallFee, recommendWaitingTime, recommendTimeTaken, recommendDistanceTaken, 0, 0, 0, 5, 0));
        riderList[msg.sender].taskIds.push(taskList.length - 1);
        return taskList.length - 1;
    }

    function taskAssignment(uint taskId) public returns (address) {
        Task memory task = taskList[taskId];
        uint pickupLocation = task.pickupLocation;
        uint minReputation = task.minReputation;
        address candidateDriverAddress = address(0);
        int minDistance = EuclideanDistanceSquare(driverOracle.getLocation(driversAddress[0]), pickupLocation);
        for (uint i = 0; i < driversAddress.length; i++) {
            bool online = driverList[driversAddress[i]].online;
            uint reputation = driverList[driversAddress[i]].reputation;
            uint[] memory taskIds = driverList[driversAddress[i]].taskIds;
            Task memory lastTask = taskIds.length > 0 ? taskList[taskIds[taskIds.length - 1]] : Task(0, address(0), 0, 0, 0, 0, 0, address(0), Status.Unclaimed, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            int driverDistance = EuclideanDistanceSquare(driverOracle.getLocation(driversAddress[i]), pickupLocation);
            if (online && reputation > minReputation && (lastTask.status == Status.Completed || taskIds.length == 0) && driverDistance < minDistance) {
                candidateDriverAddress = driversAddress[i];
            }
        }
        require(candidateDriverAddress != address(0), "No suitable driver found.");
        driverList[candidateDriverAddress].taskIds.push(taskId);
        taskList[taskId].driver = candidateDriverAddress;
        taskList[taskId].status = Status.Claimed;
        return candidateDriverAddress;
    }

    function receiveTask(uint taskId) public payable {
        Task storage task = taskList[taskId];
        require(msg.value >= task.deposit);
        task.driver = msg.sender;
        task.status = Status.Claimed;
    }

    function proofReachPickupLocation(uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function pickupRider(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofReachPickupLocation(taskId));
        task.status = Status.ReachPickupLocation;
        payable(msg.sender).transfer(task.deposit);
    }

    function proofReachDropoffLocation(uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function reachDropoffLocation(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofReachDropoffLocation(taskId));
        task.status = Status.ReachDropoffLocation;
    }

    function updateReputation(address addr, uint taskId) public {
        require(driverList[addr].addr == addr);
        Task memory task = taskList[taskId];
        require(task.driver == addr);

        int updates = 0;

        // 如果实际等待时间比推荐等待时间减少5分钟及以上，声誉值加1
        int waitingTimeDiff = int(task.recommendWaitingTime - task.realWaitingTime);
        if (waitingTimeDiff >= 5) {
            updates += 1;
        } else if (waitingTimeDiff <= -5) { 
            // 如果实际等待时间比推荐等待时间增加5分钟及以上，声誉值减1
            updates -= 1;
        }

        // 如果实际行程时间比推荐行程时间减少10分钟及以上，声誉值加1
        int takenTimeDiff = int(task.recommendTimeTaken - task.realTimeTaken);
        if (takenTimeDiff >= 10) {
            updates += 1;
        } else if (takenTimeDiff <= -10) { 
            // 如果实际行程时间比推荐行程时间增加10分钟及以上，声誉值减1
            updates -= 1;
        }

        // 如果实际行驶距离比推荐行驶距离减少300米及以上，声誉值加1
        int takenDistanceDiff = int(task.recommendDistanceTaken - task.realDistanceTaken);
        if (takenDistanceDiff >= 300) { // 300 meters
            updates += 1;
        } else if (takenDistanceDiff <= -300) { 
            // 如果实际行驶距离比推荐行驶距离增加300米及以上，声誉值减1
            updates -= 1;
        }

        // 如果乘客对车主的评价为8分及以上，声誉值加1
        if (task.evaluationToDriver >= 8) {
            updates += 1;
        } else if (task.evaluationToDriver <= 3) { 
            // 如果乘客对车主的评价为3分及以下，声誉值减1
            updates -= 1;
        }

        // 根据更新值调整车主的声誉值
        if (updates > 0) {
            driverList[addr].reputation += uint(updates);
        } else {
            driverList[addr].reputation -= uint(-updates);
        }
    }


    function getReward(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(task.status == Status.ReachDropoffLocation);
        payable(msg.sender).transfer(task.reward + task.tip);
        task.status = Status.Completed;
        driverList[task.driver].completedTaskNum++;
    }

    function getTaskInfo(uint taskId) public view returns (uint, address, uint, uint, uint, uint, uint, address, Status, uint, uint, uint, uint, uint, uint, uint, uint, uint, uint) {
        Task memory task = taskList[taskId];
        require(task.rider == msg.sender || task.driver == msg.sender);
        return (task.index, task.rider, task.pickupLocation, task.dropoffLocation, task.minReputation, task.reward, task.deposit, task.driver, task.status, task.farePerMile, task.farawayCallFee, task.recommendWaitingTime, task.recommendTimeTaken, task.recommendDistanceTaken, task.realWaitingTime, task.realTimeTaken, task.realDistanceTaken, task.evaluationToDriver, task.tip);
    }
}
