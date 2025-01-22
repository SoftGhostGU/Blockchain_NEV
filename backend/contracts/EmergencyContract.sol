// SPDX-License-Identifier: NIT 
pragma solidity ^0.8.26;

import './CarOwnerContract.sol';
import "./interfaceDriverOracleContract.sol";

contract EmergencyContract is CarOwnerContract {
    struct Task {
        uint index; // start from 0
        address rider;
        uint startLocation;
        uint endLocation;
        uint minReputation;
        uint reward; 
        uint deposit;
        address driver;
        Status status;
        uint farePerMile;
        uint farawayCallFee;
        uint emergencyCallFee;
        uint recommendWaitingTime; // minutes
        uint recommendTimeTaken; // minutes
        uint realWaitingTime; // minutes
        uint realTimeTaken; // minutes
        uint evaluationToDriver; // 1 to 10 
        uint tip;
    }

    struct Emergency {
        address addr;
        string username;
        uint registerTime;
        string teleNumber;
        uint[] taskIds;
    }

    Task[] public taskList;
    mapping(address => Emergency) public emergencyList;
    interfaceDriverOracleContract public driverOracle;

    function publishEmergencyTask(
        uint startLocation,
        uint endLocation,
        uint minReputation,
        uint recommendWaitingTime,
        uint recommendTimeTaken,
        uint farePerMile,
        uint farawayCallFee,
        uint emergencyCallFee
    ) public payable returns (uint taskId) {
        uint deposit = (farePerMile + farawayCallFee + emergencyCallFee) * 2;
        require(msg.value >= deposit, "Insufficient deposit for task");

        taskList.push(
            Task({
                index: taskList.length,
                rider: msg.sender,
                startLocation: startLocation,
                endLocation: endLocation,
                minReputation: minReputation,
                reward: 0,
                deposit: deposit,
                driver: address(0),
                status: Status.Unclaimed,
                farePerMile: farePerMile,
                farawayCallFee: farawayCallFee,
                emergencyCallFee: emergencyCallFee,
                recommendWaitingTime: recommendWaitingTime,
                recommendTimeTaken: recommendTimeTaken,
                realWaitingTime: 0,
                realTimeTaken: 0,
                evaluationToDriver: 5, // Default neutral evaluation
                tip: 0
            })
        );

        emergencyList[msg.sender].taskIds.push(taskList.length - 1);
        return taskList.length - 1;
    }

    function taskEmergencyAssignment(uint taskId) public returns (address) {
        Task storage task = taskList[taskId];
        require(task.status == Status.Unclaimed, "Task already claimed");

        address bestDriver = address(0);
        int bestDistance = type(int).max;
        uint startLocation = task.startLocation;

        for (uint i = 0; i < driversAddress.length; i++) {
            address driver = driversAddress[i];
            bool online = driverList[driver].online;
            uint reputation = driverList[driver].reputation;
            uint[] memory driverTasks = driverList[driver].taskIds;
            Task memory lastTask = driverTasks.length > 0 ? taskList[driverTasks[driverTasks.length - 1]] : Task(0, address(0), 0, 0, 0, 0, 0, address(0), Status.Unclaimed, 0, 0, 0, 0, 0, 0, 0, 0, 0);

            int driverDistance = EuclideanDistanceSquare(driverOracle.getLocation(driver), startLocation);

            if (
                online &&
                reputation >= task.minReputation &&
                (lastTask.status == Status.Completed || driverTasks.length == 0) &&
                driverDistance < bestDistance
            ) {
                bestDriver = driver;
                bestDistance = driverDistance;
            }
        }

        require(bestDriver != address(0), "No suitable driver found");

        task.driver = bestDriver;
        task.status = Status.Claimed;
        driverList[bestDriver].taskIds.push(taskId);
        return bestDriver;
    }

    function receiveEmergencyTask(uint taskId) public payable {
        Task storage task = taskList[taskId];
        require(msg.value >= task.deposit);
        task.driver = msg.sender;
        task.status = Status.Claimed;
    }

    function proofStartLocation(uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function startEmergencyTask(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofStartLocation(taskId));
        task.status = Status.ReachPickupLocation;
        payable(msg.sender).transfer(task.deposit);
    }

    function proofEndLocation(uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function endEmergencyTask(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofEndLocation(taskId));
        task.status = Status.ReachDropoffLocation;
    }

    function updateDriverReputation(address driver, uint taskId) public {
        require(driverList[driver].addr == driver, "Driver not registered");
        Task memory task = taskList[taskId];
        require(task.driver == driver, "Driver not assigned to task");

        int reputationChange = 0;
        if (int(task.recommendWaitingTime) - int(task.realWaitingTime) >= 5) {
            reputationChange += 1;
        } else if (int(task.realWaitingTime) - int(task.recommendWaitingTime) >= 5) {
            reputationChange -= 1;
        }

        if (int(task.recommendTimeTaken) - int(task.realTimeTaken) >= 10) {
            reputationChange += 1;
        } else if (int(task.realTimeTaken) - int(task.recommendTimeTaken) >= 10) {
            reputationChange -= 1;
        }

        if (task.evaluationToDriver >= 8) {
            reputationChange += 1;
        } else if (task.evaluationToDriver <= 3) {
            reputationChange -= 1;
        }

        if (reputationChange > 0) {
            driverList[driver].reputation += uint(reputationChange);
        } else {
            driverList[driver].reputation -= uint(-reputationChange);
        }
    }

    function getTaskDetails(uint taskId) public view returns (
        uint, address, uint, uint, uint, uint, uint, address, Status, uint, uint, uint, uint, uint, uint, uint, uint
    ) {
        Task memory task = taskList[taskId];
        return (
            task.index,
            task.rider,
            task.startLocation,
            task.endLocation,
            task.minReputation,
            task.reward,
            task.deposit,
            task.driver,
            task.status,
            task.farePerMile,
            task.farawayCallFee,
            task.emergencyCallFee,
            task.recommendWaitingTime,
            task.recommendTimeTaken,
            task.realWaitingTime,
            task.realTimeTaken,
            task.evaluationToDriver
        );
    }
}