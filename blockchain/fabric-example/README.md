# 运行脚本

```bash
# 下载必要的docker镜像和二进制文件
./install-fabric.sh d b

cd ./test-network

# 启动测试网络并创建一个名为 `mychannel` 的 channel 
./network.sh up createChannel -c mychannel

# 将使用 ts/java/go 开发的 chaincode (链码，类似智能合约) 打包并部署到刚才创建的 channel 上
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincodes/chaincode-typescript/ -ccl typescript
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincodes/chaincode-java/ -ccl java
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincodes/chaincode-go/ -ccl go

# 三条脚本中使用一条即可
# 以上工作为区块连开发部分工作

# 运行调用链上资源的 ts 的程序
cd ../asset-transfer-basic/application-gateway/application-gateway-typescript
npm install
npm start

# 运行调用链上资源的 go 的程序
cd ../asset-transfer-basic/application-gateway/application-gateway-go
go run assetTransfer.go

# 运行调用链上资源的 java 的程序
cd ../asset-transfer-basic/application-gateway/application-gateway-java
./gradlew run
```

程序通过接口和链码进行交互，从而操作链上数据

[Node.js API](https://github.com/hyperledger/fabric-chaincode-node)

[GO API](https://github.com/hyperledger/fabric-contract-api-go)

[JAVA API](https://github.com/hyperledger/fabric-chaincode-java)


# Hyperledger Fabric 作用

存储任意的结构化数据，并在某些条件发生变化的时候，自动化地对存储的数据进行处理。


