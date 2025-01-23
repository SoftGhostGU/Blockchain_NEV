var TrafficInfo = artifacts.require("../contracts/TrafficInfoCollectionContract.sol");

module.exports = function(deployer) {
  deployer.deploy(TrafficInfo);
};