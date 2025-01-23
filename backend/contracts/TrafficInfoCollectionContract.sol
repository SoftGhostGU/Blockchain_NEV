// SPDX-License-Identifier: NIT
pragma solidity ^0.8.26;

import './CarOwnerContract.sol';
import "./interfaceDriverOracleContract.sol";

contract TrafficInfoCollectionContract is CarOwnerContract {
    struct Task {
        uint index;
        // address carOwnerAddress;
        uint startCollectingLocation;
        uint endCollectingLocation;
        uint startCollectingTime;
        uint endCollectingTime;
        uint minReputation;
        uint reward;
        address driver;
        Status status;
        uint farePerMile;
        uint evaluationToDriver;
    }

    struct Traffic {
        address addr;
        string username;
        uint registerTime;
        string teleNumber;
        uint[] taskIds;
    }

    Task[] public taskList;
    mapping(address => Traffic) public trafficCollectors;
    interfaceDriverOracleContract public driverOracle;

    function publishTrafficTask(
        uint startCollectingLocation,
        uint endCollectingLocation,
        uint startCollectingTime,
        uint endCollectingTime,
        uint minReputation,
        uint farePerMile
    ) public payable returns (uint taskId) {
        // uint reward = farePerMile * (endCollectingLocation - startCollectingLocation); // Reward calculated based on duration
        // require(msg.value >= reward, "Insufficient reward");

        taskList.push(
            Task({
                index: taskList.length,
                startCollectingLocation: startCollectingLocation,
                endCollectingLocation: endCollectingLocation,
                startCollectingTime: startCollectingTime,
                endCollectingTime: endCollectingTime,
                minReputation: minReputation,
                reward: 0,
                driver: address(0),
                status: Status.Unclaimed,
                farePerMile: farePerMile,
                evaluationToDriver: 0
            })
        );

        return taskList.length - 1;
    }

    function assignTrafficTask(uint taskId) public returns (address) {
        Task storage task = taskList[taskId];
        require(task.status == Status.Unclaimed, "Task already claimed");

        address bestDriver = address(0);
        int bestDistance = type(int).max;
        uint startLocation = task.startCollectingLocation;

        for (uint i = 0; i < driversAddress.length; i++) {
            address driver = driversAddress[i];
            bool online = driverList[driver].online;
            uint reputation = driverList[driver].reputation;
            uint driverLocation = driverOracle.getLocation(driver);
            int minDistance = EuclideanDistanceSquare(driverLocation, startLocation);
        
            if (
                online &&
                reputation >= task.minReputation &&
                driverLocation == startLocation && // Example: driver must start at the specified location
                minDistance < bestDistance
            ) {
                bestDriver = driver;
                bestDistance = minDistance;
            }
        }

        require(bestDriver != address(0), "No suitable driver found");

        task.driver = bestDriver;
        task.status = Status.Claimed;
        driverList[bestDriver].taskIds.push(taskId);
        return bestDriver;
    }

    function receiveTask(uint taskId) public payable {
        Task storage task = taskList[taskId];
        task.driver = msg.sender;
        task.status = Status.Claimed;
    }

    function completeTrafficTask(uint taskId, uint startTime, uint endTime) public {
        Task storage task = taskList[taskId];
        require(msg.sender == task.driver, "Only the assigned driver can complete the task");
        require(task.status == Status.Claimed, "Task is not active");

        task.status = Status.Completed;
        uint evaluationToDriver = 10 * (endTime - startTime);

        // 更新采集者的信誉
        uint reputationChange = 10 * (evaluationToDriver / 10); // Simple reputation adjustment
        driverList[task.driver].reputation += reputationChange;

        // 支付奖励
        task.reward = task.farePerMile * (task.endCollectingLocation - task.startCollectingLocation);
        payable(task.driver).transfer(task.reward);
    }

    function getTaskInfo(uint taskId) public view returns (
        uint, uint, uint, uint, uint, uint, address, Status, uint, uint
    ) {
        Task memory task = taskList[taskId];
        return (
            task.index,
            task.startCollectingLocation,
            task.endCollectingLocation,
            task.startCollectingTime,
            task.endCollectingTime,
            task.minReputation,
            task.reward,
            task.driver,
            task.status,
            task.farePerMile
        );
    }
}