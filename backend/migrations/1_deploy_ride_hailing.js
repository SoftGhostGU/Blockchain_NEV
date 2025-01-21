var RideHailing = artifacts.require("../contracts/RideHailing.sol");

module.exports = function(deployer) {
    deployer.deploy(RideHailing);
};