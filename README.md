# Blockchain_NEV

## 前端部分

环境准备：

- `node.js`
- `pnpm`

运行：

根目录下：
- `pnpm install`
- `pnpm run dev:user:h5` or `pnpm run dev:user:weapp`启动user端
- `pnpm run dev:owner`启动owner端

## 后端部分

环境准备：

- `java` 

运行：

- 

## 区块链

环境准备：

- `go` or `java` or `node.js`

运行：


### java版本下的运行方式：

1. 编写java文件`MyChaincode.java`
	- 继承 `Contract` 或实现 `Chaincode` 接口，覆盖关键方法
2. 开发阶段测试方法
	- 单元测试方法
		- 使用**JUnit**或**Mockito**模拟`ChaincodeStub`，直接测试链码逻辑
		- 实例代码见下方`@Test`代码
	- 集成测试（本地Fabric网络）
		- 启动测试网络`./network.sh up createChannel -c mychannel`
		- 本地打包链码`./gradlew build`
		- 测试网部署链码`./network.sh deployCC -ccn myjavacc -ccp /path/to/your-java-chaincode -ccl java`
		- 调用链码
			- `peer chaincode invoke -C mychannel -n myjavacc -c '{"function":"set", "Args":["key1", "value1"]}'`
			- `peer chaincode query -C mychannel -n myjavacc -c '{"function":"get", "Args":["key1"]}'`
	- 使用 Fabric Gateway SDK 测试
		- 在 Java 应用中通过 [Fabric Gateway SDK](https://hyperledger.github.io/fabric-gateway/) 直接与链码交互
		- 参考下方代码片段

```java
@Test
public void testSetAndGet() {
    MyChaincode chaincode = new MyChaincode();
    ChaincodeStub stub = mock(ChaincodeStub.class);

    // 测试 set 方法
    when(stub.getFunction()).thenReturn("set");
    when(stub.getParameters()).thenReturn(Arrays.asList("key1", "value1"));
    Response setResponse = chaincode.invoke(stub);
    assertEquals("OK", setResponse.getMessage());

    // 测试 get 方法
    when(stub.getFunction()).thenReturn("get");
    when(stub.getParameters()).thenReturn(Arrays.asList("key1"));
    when(stub.getStringState("key1")).thenReturn("value1");
    Response getResponse = chaincode.invoke(stub);
    assertEquals("value1", getResponse.getMessage());
}
```

```java
// 使用 Fabric Gateway SDK 测试

// 初始化 Gateway 连接
Gateway gateway = Gateway.newBuilder()
    .identity(wallet, "user1")
    .networkConfig(Paths.get("connection.yaml"))
    .connect();

// 调用链码
Contract contract = gateway.getNetwork("mychannel").getContract("myjavacc");
contract.submitTransaction("set", "key1", "value1");
byte[] result = contract.evaluateTransaction("get", "key1");
System.out.println(new String(result));
```

## 其他备忘录

### 服务器

- 打开安全组，开放所有端口-1/-1，优先级1
- 环境配置
