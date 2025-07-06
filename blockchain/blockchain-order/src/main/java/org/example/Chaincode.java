/*
 * SPDX-License-Identifier: 
 */

package org.example;

import java.util.List;

import org.hyperledger.fabric.shim.ChaincodeBase;
import org.hyperledger.fabric.shim.ChaincodeStub;

public class Chaincode extends ChaincodeBase {

    @Override
    public Response init(ChaincodeStub stub) { // 初始化链码
        String fcn = stub.getFunction();
        List<String> params = stub.getParameters();
        System.out.printf("init() %s %s\n", fcn, params.toArray());
        return ChaincodeBase.newSuccessResponse();
    }

    @Override
    public Response invoke(ChaincodeStub stub) { // 处理交易
        String fcn = stub.getFunction();
        List<String> params = stub.getParameters();
        System.out.printf("invoke() %s %s\n", fcn, params.toArray());
        return ChaincodeBase.newSuccessResponse();
    }

    // 再添加自定义逻辑

}
