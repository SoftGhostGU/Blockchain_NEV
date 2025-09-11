### 前后端连接Fabric说明



+ 因为服务器在内网，连接上面的Fabric网络要通过内网穿透，这里使用zerotier
    + 在本地（开发环境）下载zerotier，加入网络 `45b6e887e2e76e5f` ，发送加入请求后联系我这边授权
    + 服务器的外网ip为 `8.153.93.198` ，这个是使用ssh连接时用的，zerotier分配到内网ip为`10.147.17.184` 和`172.28.253.120`，可以运行 `ping 10.147.17.184` 检测是否成功接入内网
+ 和Fabric网络的连接使用了tls和ca，需要将`crypto-config`文件夹下的内容存放在本地，连接时要访问其中的密钥和ca证书

```typescript
const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve('crypto-config', 'peerOrganizations', 'org1.example.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate directory.
const certDirectoryPath = envOrDefault('CERT_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault("PEER_ENDPOINT", "10.147.17.184:7051");

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');
```

+ 上面是使用ts连接Fabric网络时要配置的变量，仅作案例，具体可以参考`fabric-sample`，或者联系我
+ 后端在加入内网后目前可以正常启动，确保`application.yml`配置中`peerEndpoint`为`10.147.17.184:7051`。