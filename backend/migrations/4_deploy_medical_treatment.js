var MedicalTreatment = artifacts.require("../contracts/MedicalTreatment");

module.exports = function(deployer) {
  deployer.deploy(MedicalTreatment);
};