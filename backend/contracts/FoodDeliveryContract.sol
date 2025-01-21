// SPDX-License-Identifier: NIT
pragma solidity ^0.8.26;

import './CarOwnerContract.sol';
import "./interfaceDriverOracleContract.sol";

contract FoodDeliveryContract is CarOwnerContract{
    struct Task {
        uint index;
        address food;
        uint getFoodShopLocation;
        uint sendFoodUserLocation;
        uint minReputation;
        uint reward;
        uint deposit;
        address driver;
        Status status;
        uint startDeliveryPrice; // 起送费
        uint foodPrice; // 食品价格
        uint farawayDeliveryPrice; // 运费（远距离）
        uint recommendTakingTime; // 预估取货时间
        uint recommendDeliveringTime; // 预估送货时间
        uint realTakingTime; // 实际取货时间
        uint realDeliveringTime; // 实际送货时间
        uint evaluationToDeliverer; // 0-10
        uint tip;
    }

    struct Foods {
        address addr;
        string buyerName;
        uint boughtTime;
        string teleNumber;
        uint[] taskIds;
    }

    Task[] public taskList;
    mapping(address => Foods) public foodList;
    interfaceDriverOracleContract public driverOracle;

    function publishTask(
        uint getFoodShopLocation,
        uint sendFoodUserLocation,
        uint minReputation,
        uint recommendTakingTime,
        uint recommendDeliveringTime,
        uint startDeliveryPrice,
        uint foodPrice,
        uint farawayDeliveryPrice
    ) public payable returns (uint _index) {
        uint deposit = (foodPrice + farawayDeliveryPrice) * 2;
        require(msg.value >= deposit);
        
        taskList.push(
            Task({
                index: taskList.length,
                food: msg.sender,
                getFoodShopLocation: getFoodShopLocation,
                sendFoodUserLocation: sendFoodUserLocation,
                minReputation: minReputation,
                reward: 0,
                deposit: deposit,
                driver: address(0),
                status: Status.Unclaimed,
                startDeliveryPrice: startDeliveryPrice,
                foodPrice: foodPrice,
                farawayDeliveryPrice: farawayDeliveryPrice,
                recommendTakingTime: recommendTakingTime,
                recommendDeliveringTime: recommendDeliveringTime,
                realTakingTime: 0,
                realDeliveringTime: 0,
                evaluationToDeliverer: 5, // Default neutral rating
                tip: 0
            })
        );
        foodList[msg.sender].taskIds.push(taskList.length - 1);
        return taskList.length - 1;
    }

    function taskAssignment(uint taskId) public returns (address) {
        Task memory task = taskList[taskId];
        uint getFoodShopLocation = task.getFoodShopLocation;
        uint minReputation = task.minReputation;
        address candidateDriver = address(0);
        int minDistance = EuclideanDistanceSquare(driverOracle.getLocation(driversAddress[0]), getFoodShopLocation);

        for (uint i = 0; i < driversAddress.length; i++) {
            address driver = driversAddress[i];
            bool online = driverList[driver].online;
            uint reputation = driverList[driver].reputation;
            uint[] memory taskIds = driverList[driversAddress[i]].taskIds;
            Task memory lastTask = taskIds.length > 0 ? taskList[taskIds[taskIds.length - 1]] : Task(0, address(0), 0, 0, 0, 0, 0, address(0), Status.Unclaimed, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            int driverDistance = EuclideanDistanceSquare(driverOracle.getLocation(driver), getFoodShopLocation);

            if (online && reputation >= minReputation && (lastTask.status == Status.Completed || taskIds.length == 0) && driverDistance < minDistance) {
                candidateDriver = driver;
                minDistance = driverDistance;
            }
        }

        require(candidateDriver != address(0), "No suitable driver found");

        driverList[candidateDriver].taskIds.push(taskId);
        taskList[taskId].driver = candidateDriver;
        taskList[taskId].status = Status.Claimed;

        return candidateDriver;
    }

    function receiveTask(uint taskId) public payable {
        Task storage task = taskList[taskId];
        require(msg.value >= task.deposit);
        task.driver = msg.sender;
        task.status = Status.Claimed;
    }

    function proofReachGetFoodLocation (uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function pickUpFood(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofReachGetFoodLocation(taskId));
        task.status = Status.ReachPickupLocation;
        payable(msg.sender).transfer(task.deposit);
    }

    function proofReachSendFoodUserLocation (uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function reachSendFoodUserLocation(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofReachSendFoodUserLocation(taskId));
        task.status = Status.ReachDropoffLocation;
    }

    function updateReputation(address addr, uint taskId) public {
        require(driverList[addr].addr == addr);
        Task memory task = taskList[taskId];
        require(task.driver == addr);

        int reputationChange = 0;
        if (int(task.recommendTakingTime) - int(task.realTakingTime) >= 5) {
            reputationChange += 1;
        } else if (int(task.realTakingTime) - int(task.recommendTakingTime) >= 5) {
            reputationChange -= 1;
        }

        if (int(task.recommendDeliveringTime) - int(task.realDeliveringTime) >= 10) {
            reputationChange += 1;
        } else if (int(task.realDeliveringTime) - int(task.recommendDeliveringTime) >= 10) {
            reputationChange -= 1;
        }

        if (task.evaluationToDeliverer >= 8) {
            reputationChange += 1;
        } else if (task.evaluationToDeliverer <= 3) {
            reputationChange -= 1;
        }

        if (reputationChange > 0) {
            driverList[addr].reputation += uint(reputationChange);
        } else {
            driverList[addr].reputation -= uint(-reputationChange);
        }
    }

    function getTaskInfo(uint taskId) public view returns (
        uint, address, uint, uint, uint, uint, uint, address, Status, uint, uint, uint, uint, uint, uint, uint, uint, uint
    ) {
        Task memory task = taskList[taskId];
        require(task.food == msg.sender || task.driver == msg.sender);
        return (
            task.index,
            task.food,
            task.getFoodShopLocation,
            task.sendFoodUserLocation,
            task.minReputation,
            task.reward,
            task.deposit,
            task.driver,
            task.status,
            task.startDeliveryPrice,
            task.foodPrice,
            task.farawayDeliveryPrice,
            task.recommendTakingTime,
            task.recommendDeliveringTime,
            task.realTakingTime,
            task.realDeliveringTime,
            task.evaluationToDeliverer,
            task.tip
        );
    }
}