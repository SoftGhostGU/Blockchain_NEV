// SPDX-License-Identifier: NIT
pragma solidity ^0.8.26;

import './CarOwnerContract.sol';
import "./interfaceDriverOracleContract.sol";

contract MedicalTreatmentContract is CarOwnerContract{
    struct Task {
        uint index;
        address medicine;
        uint pickMedicineLocation;
        uint sendMedicineLocation;
        uint minReputation;
        uint reward;
        uint deposit;
        address driver;
        Status status;
        uint farePerMile;
        uint farawayCallFee;
        uint emergencyCallFee;
        uint recommendWaitingTime;
        uint recommendTimeTaking;
        uint realWaitingTime;
        uint realTimeTaking;
        uint evaluationToSender;
        uint tip;
    }

    struct Medicine {
        address addr;
        string username;
        uint registerTime;
        string teleNumber;
        uint[] taskIds;
    }

    Task[] public taskList;
    mapping(address => Medicine) public medicineList;
    interfaceDriverOracleContract public driverOracle;

    function publishTask(
        uint pickMedicineLocation,
        uint sendMedicineLocation,
        uint minReputation,
        uint recommendWaitingTime,
        uint recommendTimeTaking,
        uint farePerMile,
        uint farawayCallFee,
        uint emergencyCallFee
    ) public payable returns (uint _index) {
        uint deposit = (farePerMile + farawayCallFee + emergencyCallFee) * 2;
        require(msg.value >= deposit, "Insufficient deposit");

        taskList.push(
            Task({
                index: taskList.length,
                medicine: msg.sender,
                pickMedicineLocation: pickMedicineLocation,
                sendMedicineLocation: sendMedicineLocation,
                minReputation: minReputation,
                reward: 0,
                deposit: deposit,
                driver: address(0),
                status: Status.Unclaimed,
                farePerMile: farePerMile,
                farawayCallFee: farawayCallFee,
                emergencyCallFee: emergencyCallFee,
                recommendWaitingTime: recommendWaitingTime,
                recommendTimeTaking: recommendTimeTaking,
                realWaitingTime: 0,
                realTimeTaking: 0,
                evaluationToSender: 5, // Default neutral rating
                tip: 0
            })
        );
        medicineList[msg.sender].taskIds.push(taskList.length - 1);
        return taskList.length - 1;
    }

    function taskAssignment(uint taskId) public returns (address) {
        Task memory task = taskList[taskId];
        uint pickMedicineLocation = task.pickMedicineLocation;
        uint minReputation = task.minReputation;
        address candidateDriver = address(0);
        int minDistance = EuclideanDistanceSquare(driverOracle.getLocation(driversAddress[0]), pickMedicineLocation);

        for (uint i = 0; i < driversAddress.length; i++) {
            address driver = driversAddress[i];
            bool online = driverList[driver].online;
            uint reputation = driverList[driver].reputation;
            uint[] memory taskIds = driverList[driver].taskIds;
            Task memory lastTask = taskIds.length > 0 ? taskList[taskIds[taskIds.length - 1]] : Task(0, address(0), 0, 0, 0, 0, 0, address(0), Status.Unclaimed, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            int driverDistance = EuclideanDistanceSquare(driverOracle.getLocation(driver), pickMedicineLocation);

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
        require(msg.value >= task.deposit, "Insufficient deposit");
        task.driver = msg.sender;
        task.status = Status.Claimed;
    }

    function proofReachPickUpMedicineLocation(uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function pickUpMedicine(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofReachPickUpMedicineLocation(taskId));
        task.status = Status.ReachPickupLocation;
        payable(msg.sender).transfer(task.deposit);
    }

    function proofReachSendMedicineLocation(uint taskId) public pure returns (bool) {
        // 这里需要实际的验证逻辑
        taskId = taskId;
        return true;
    }

    function deliverMedicine(uint taskId) public {
        Task storage task = taskList[taskId];
        require(task.driver == msg.sender);
        require(proofReachSendMedicineLocation(taskId));
        task.status = Status.ReachDropoffLocation;
    }

    function updateReputation(address addr, uint taskId) public {
        require(driverList[addr].addr == addr, "Driver not registered");
        Task memory task = taskList[taskId];
        require(task.driver == addr, "Driver not assigned to task");

        int reputationChange = 0;
        if (int(task.recommendWaitingTime) - int(task.realWaitingTime) >= 5) {
            reputationChange += 1;
        } else if (int(task.realWaitingTime) - int(task.recommendWaitingTime) >= 5) {
            reputationChange -= 1;
        }

        if (int(task.recommendTimeTaking) - int(task.realTimeTaking) >= 10) {
            reputationChange += 1;
        } else if (int(task.realTimeTaking) - int(task.recommendTimeTaking) >= 10) {
            reputationChange -= 1;
        }

        if (task.evaluationToSender >= 8) {
            reputationChange += 1;
        } else if (task.evaluationToSender <= 3) {
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
        require(task.medicine == msg.sender || task.driver == msg.sender, "Unauthorized access");
        return (
            task.index,
            task.medicine,
            task.pickMedicineLocation,
            task.sendMedicineLocation,
            task.minReputation,
            task.reward,
            task.deposit,
            task.driver,
            task.status,
            task.farePerMile,
            task.farawayCallFee,
            task.emergencyCallFee,
            task.recommendWaitingTime,
            task.recommendTimeTaking,
            task.realWaitingTime,
            task.realTimeTaking,
            task.evaluationToSender,
            task.tip
        );
    }
}