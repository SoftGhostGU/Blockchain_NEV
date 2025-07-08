/*
 * SPDX-License-Identifier: 
 */

package org.example;

import java.util.List;

import com.owlike.genson.Genson;
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
        String fcn = stub.getFunction(); // 获取函数名和参数
        List<String> params = stub.getParameters(); // 从fcn获取参数
        System.out.printf("invoke() %s %s\n", fcn, params.toArray());

        if (fcn.equals("putData")) { // 存储键值对到账本
            return putData(stub, params);
        } else if (fcn.equals("putDataWithData")) { // 存储 Model 对象到账本
            return putDataWithData(stub);
        } else if (fcn.equals("getData")) { // 从账本中查询值
            return getData(stub, params);
        }

        // return ChaincodeBase.newSuccessResponse();
    }

    // 再添加自定义逻辑

    // 存储键值对到账本
    private Response putData(ChaincodeStub stub, List<String> params) {
        if (params.size() != 2) {
            return ChaincodeBase.newErrorResponse("putData函数需要两个参数：键和值");
        }
        String key = params.get(0);
        String value = params.get(1);
        stub.putStringState(key, value);
        return ChaincodeBase.newSuccessResponse("数据已成功存储");
    }

    private Response putDataWithData(ChaincodeStub stub) {
        // 假设参数是从 stub 中获取的
        List<String> params = stub.getParameters();
        if (params.size() != 6) {
            return ChaincodeBase.newErrorResponse("putDataWithData函数需要六个参数：orderId, creator, receiver, createTime, category, amount");
        }

        // 使用参数创建 Model 对象
        Model model = Model.builder()
                .orderId(params.get(0))
                .creator(params.get(1))
                .receiver(params.get(2))
                .createTime(params.get(3))
                .category(params.get(4))
                .amount(params.get(5))
                .build();

        // 获取 orderId 作为键
        String id = model.getOrderId();

        // 使用 Genson 库将 Model 对象序列化为 JSON 字符串
        Genson genson = new Genson();
        String modelJson = genson.serialize(model);

        // 将 JSON 字符串存储到账本中
        stub.putStringState(id, modelJson);

        return ChaincodeBase.newSuccessResponse("数据已成功存储");
    }

    // 从账本中查询值
    private Response getData(ChaincodeStub stub, List<String> params) {
        if (params.size() != 1) {
            return ChaincodeBase.newErrorResponse("getData函数需要一个参数：键");
        }
        String key = params.get(0);
        String value = stub.getStringState(key);
        if (value == null || value.isEmpty()) {
            return ChaincodeBase.newErrorResponse("未找到对应的键值对");
        }
        return ChaincodeBase.newSuccessResponse(value);
    }
}
