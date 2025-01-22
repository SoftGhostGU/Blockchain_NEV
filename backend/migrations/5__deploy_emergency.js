var Emergency = artifacts.require("../contracts/Emergency");

module.exports = function(deployer) {
  deployer.deploy(Emergency);
};