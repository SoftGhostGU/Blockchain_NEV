// SPDX-License-Identifier: NIT
pragma solidity ^0.8.26;

import './CarOwnerContract.sol';
import "./interfaceDriverOracleContract.sol";

contract GoodsDeliveryContract is CarOwnerContract {
    struct Task {
        uint index;
        address goods;
        uint fromLocation;
        uint toLocation;
        uint minReputation;
        uint reward;
        uint deposit;
        address buyer;
        address driver;
        uint weight;
        uint deadline;
        uint important;
        Status status;
        uint farePerWeight;
        uint farePerMile;
        uint recommendWaitingTime; // minutes
        uint recommendTimeTaken; // minutes
        uint recommendDistanceTaken; // meters
        uint realWaitingTime; // minutes
        uint realTimeTaken; // minutes
        uint goodsCompleteness; // 0-100
    }

    struct Goods {
        address addr;
        string username;
        uint registerTime;
        string teleNumber;
        uint[] taskIds;
    }

    Task[] public taskList;
    mapping (address => Goods) public goodsList;
    interfaceDriverOracleContract private driverOracle; // 使用接口实例化 driverOracleAddress

    function publishTask(uint _fromLocation, uint _toLocation, uint _minReputation, uint _weight, uint _deadline, uint _important, uint _farePerWeight, uint _farePerMile, uint _recommendWaitingTime, uint _recommendTimeTaken, uint _recommendDistanceTaken) public payable returns (uint) {
        uint deposit = (_recommendDistanceTaken * _farePerMile) + (_weight * _farePerWeight) * 2;
        if (_important == 1) deposit *= 2; // 加急
        require(msg.value >= deposit, "Deposit not enough");
        taskList.push(Task(taskList.length, msg.sender, _fromLocation, _toLocation, _minReputation, 0, deposit, address(0), address(0), _weight, _deadline, _important, Status.Unclaimed, _farePerWeight, _farePerMile, _recommendWaitingTime, _recommendTimeTaken, _recommendDistanceTaken, 0, 0, 0));
        goodsList[msg.sender].taskIds.push(taskList.length - 1);
        return taskList.length - 1;
    }

    function taskAssignment (uint taskId) public returns (address) {
        Task memory task = taskList[taskId];
        uint fromLocation = task.fromLocation;
        uint minReputation = task.minReputation;
        address candidateDriverAddress = address(0);
        int minDistance = EuclideanDistanceSquare(driverOracle.getLocation(driversAddress[0]), fromLocation);
        for (uint i = 0; i < driversAddress.length; i++) {
            bool online = driverList[driversAddress[i]].online;
            uint reputation = driverList[driversAddress[i]].reputation;
            uint[] memory taskIds = goodsList[driversAddress[i]].taskIds;
            Task memory lastTask = taskIds.length > 0 ? taskList[taskIds[taskIds.length - 1]] : Task(0, address(0), 0, 0, 0, 0, 0, address(0), address(0), 0, 0, 0, Status.Unclaimed, 0, 0, 0, 0, 0, 0, 0, 0);
            int driverDistance = EuclideanDistanceSquare(driverOracle.getLocation(driversAddress[i]), fromLocation);
            if (online && reputation >= minReputation && driverDistance < minDistance && (lastTask.status == Status.Completed || taskIds.length == 0)) {
                candidateDriverAddress = driversAddress[i];
                minDistance = driverDistance;
            }
        }
        require(candidateDriverAddress != address(0), "No suitable driver found.");
        driverList[candidateDriverAddress].taskIds.push(taskId);
        taskList[taskId].driver = candidateDriverAddress;
        taskList[taskId].status = Status.Claimed;
        return candidateDriverAddress;
    }

    function receiveTask (uint taskId) public payable {
        Task storage task = taskList[taskId];
        require(msg.value >= task.deposit);
        task.driver = msg.sender;
        task.status = Status.Claimed;
    }

    function proofGetGoods (uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }
    
    function pickupGoods (uint taskId) public {
        Task storage task = taskList[taskId];
        require (task.driver == msg.sender);
        require (proofGetGoods(taskId));
        task.status = Status.ReachPickupLocation;
        payable(msg.sender).transfer(task.deposit);
    }

    function proofSentGoods(uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    } 

    function reachBuyer (uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofSentGoods(taskId));
        task.status = Status.ReachDropoffLocation;
    }

    function updateReputation (address addr, uint taskId) public {
        require (driverList[addr].addr == addr);
        Task memory task = taskList[taskId];
        require (task.driver == addr);

        int update = 0;

        int waitingTimeDiff = int(task.realWaitingTime - task.recommendWaitingTime);
        if (waitingTimeDiff > 5) {
            update += 2;
        } else if (waitingTimeDiff < -5) {
            update -= 2;
        }

        int sendingTimeDiff = int(task.realTimeTaken - task.recommendTimeTaken);
        int deadlineTimeDiff = int(task.realTimeTaken - task.deadline);
        if (sendingTimeDiff > 5) {
            update += 2;
        } else if (deadlineTimeDiff < 0) {
            update += 1;
        } else if (deadlineTimeDiff > 0) {
            update -= 2;
        }

        if (task.goodsCompleteness == 100) {
            update += 2;
        } else if (task.goodsCompleteness < 50) {
            update -= 5;
        } else if (task.goodsCompleteness < 80) {
            update -= 2;
        } else {
            update -= 1;
        }

        if (update > 0) {
            driverList[addr].reputation += uint(update);
        } else {
            driverList[addr].reputation -= uint(-update);
        }
    }

    function getReward(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(task.status == Status.ReachDropoffLocation);
        payable(msg.sender).transfer(task.reward);
        task.status = Status.Completed;
        driverList[task.driver].completedTaskNum++;
    }

    function getTaskInfo(uint taskId) public view returns (uint, address, uint, uint, uint, uint, uint, address, address, uint, uint, uint, Status, uint, uint, uint, uint, uint, uint, uint, uint) {
        Task memory task = taskList[taskId];
        require(task.buyer == msg.sender || task.driver == msg.sender);
        return (task.index, task.goods, task.fromLocation, task.toLocation, task.minReputation, task.reward, task.deposit, task.buyer, task.driver, task.weight, task.deadline, task.important, task.status, task.farePerWeight, task.farePerMile, task.recommendWaitingTime, task.recommendTimeTaken, task.recommendDistanceTaken, task.realWaitingTime, task.realTimeTaken, task.goodsCompleteness);
    }
}