var FoodDelivery = artifacts.require("FoodDelivery");

module.exports = function(deployer) {
  deployer.deploy(FoodDelivery);
};