var FoodDelivery = artifacts.require("../contracts/FoodDelivery");

module.exports = function(deployer) {
  deployer.deploy(FoodDelivery);
};