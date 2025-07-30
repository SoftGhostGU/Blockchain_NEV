# 总体说明

+ `./caller_examples/src/app.ts` 为使用ts连接fabric账本，并通过chaincode提供的函数管理账本上的数据的代码
+ `./src` 中 
    + `financials.ts` 定义了账本上存储的数据结构
    + `financialsTransfer.ts` 提供了操作账本的函数

# chaincode描述 

> 账本存储的数据结构

```typescript
/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

export enum OrderStatusType {
    PENDING = '待处理',
    ACCEPTED = '已接受',
    COMPLETED = '已完成',
    CANCELED = '已取消',
}

@Object()
export class Orders {
    @Property()
    public orderID: string = '';

    @Property()
    public userID: number = 0;

    @Property()
    public ownerID: number = 0;

    @Property()
    public startLocation: string = '';

    @Property()
    public endLocation: string = '';

    @Property()
    public startTime: string = '';

    @Property()
    public miles: string = '';

    @Property()
    public orderStatus: OrderStatusType = OrderStatusType.PENDING;

    @Property()
    public orderType: string = '';

    @Property()
    public cost: number = 0;

    @Property()
    public rate: number = 5;

    @Property()
    public comment: string = '';
}

```

> 操作账本的函数

```ts
@Transaction()
public async InitLedger(ctx: Context): Promise<void> { ··· }

// CreateOrder creates a new order with given details
@Transaction()
public async CreateOrder(
    ctx: Context, 
    orderID: string,
    userID: string,
    ownerID: string,
    startLocation: string,
    endLocation: string,
    startTime: string,
    miles: string,
    orderStatus: OrderStatusType,
    orderType: string,
    cost: string,
    rate: string,
    comment: string
): Promise<void> { ··· }

// QueryOrder returns the details of an order with given orderID
@Transaction()
public async QueryOrder(ctx: Context, orderID: string) { ··· }

// UpdateOrder updates an existing order with given orderID
@Transaction()
public async UpdateOrder(
    ctx: Context, 
    orderID: string,
    userID: string,
    ownerID: string,
    startLocation: string,
    endLocation: string,
    startTime: string,
    miles: string,
    orderStatus: OrderStatusType,
    orderType: string,
    cost: string,
    rate: string,
    comment: string
): Promise<void> { ··· }

// DeleteOrder deletes an order with given orderID
@Transaction()
public async DeleteOrder(ctx: Context, orderID: string): Promise<void> { ··· }

// OrderExists returns true if an order with given orderID exists in the ledger
@Transaction(false)
@Returns('boolean')
public async OrderExists(ctx: Context, orderID: string): Promise<boolean> { ··· }

// TransferOrder transfers ownership of an order with given orderID to a new owner with given newOwnerID
@Transaction()
public async TransferOrder(ctx: Context, orderID: string, newOwnerID: string): Promise<void> { ··· }

// QueryAllOrders returns all orders in the ledger
@Transaction(false)
@Returns('string')
public async QueryAllOrders(ctx: Context): Promise<string> { ··· }
```

> 使用 ts 调用 **操作账本的函数** 对账本进行操作

```ts
/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of orders on the ledger');

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllOrders(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetAllOrders, function returns all the current orders on the ledger');

    const resultBytes = await contract.evaluateTransaction('QueryAllOrders');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result: unknown = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createOrder(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: CreateOrder, creates new order with ID, Color, Size, Owner and AppraisedValue arguments');

    const orderID = 'ORD20250717001';
    const userID = '1';
    const ownerID = '2';
    const startLocation = 'Tokyo Station';
    const endLocation = 'Shibuya';
    const startTime = new Date().toISOString(); 
    const miles = '12.5';
    const orderStatus = 'pending';
    const orderType = 'standard';
    const cost = '3000';
    const rate = '4.8';
    const comment = 'Fast pickup';

    try {
        await contract.submitTransaction(
            'CreateOrder',
            orderID,
            userID,
            ownerID,
            startLocation,
            endLocation,
            startTime,
            miles,
            orderStatus,
            orderType,
            cost,
            rate,
            comment
        );
        console.log(`✅ Order ${orderID} created successfully`);
    } catch (error) {
        console.error(`❌ Failed to create order: ${error}`);
    }
}

/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferOrderAsync(contract: Contract): Promise<void> {
    console.log('\n--> Async Submit Transaction: TransferOrder, updates existing order owner');

    const orderID = 'ORD20250717001'; // 请确保这是存在于链上的订单ID
    const newOwnerID = '3';             // 新的接单人

    try {
        const commit = await contract.submitAsync('TransferOrder', {
            arguments: [orderID, newOwnerID],
        });
        console.log(`*** Successfully submitted TransferOrder transaction for orderID ${orderID}`);
        console.log('*** Waiting for transaction commit...');

        const status = await commit.getStatus();
        if (!status.successful) {
            throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
        }

        console.log(`✅ Transaction ${status.transactionId} committed successfully`);
    } catch (error) {
        console.error(`❌ Failed to transfer order: ${error}`);
    }
}

async function readOrderByID(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: ReadOrder, function returns order attributes');

    const orderID = 'ORD20250717001';

    try {
        const resultBytes = await contract.evaluateTransaction('QueryOrder', orderID);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result: unknown = JSON.parse(resultJson);

        console.log(`✅ Order ${orderID} found:`);
        console.log(result);
    } catch (error) {
        console.error(`❌ Failed to query order ${orderID}:`, error);
    }
}

/**
 * submitTransaction() will throw an error containing details of any error responses from the smart contract.
 */
async function updateOrder(contract: Contract): Promise<void>{
    console.log('\n--> Submit Transaction: UpdateOrder ORD20250717001, ORD20250717001 does not exist and should return an error');

    const orderID = 'ORD20250717001'; // 替换为你要更新的订单ID

    // ⚠️ 所有参数都必须传 string，即使是数字类型（链码内部用 Number() 转换）
    const userID = '101';
    const ownerID = '202';
    const startLocation = 'Shinagawa';
    const endLocation = 'Akihabara';
    const startTime = new Date().toISOString();
    const miles = '14.3';
    const orderStatus = 'completed'; // 或 pending/accepted 等等，看你的枚举类型
    const orderType = 'express';
    const cost = '5000';
    const rate = '5.0';
    const comment = 'Smooth and fast trip';

    try {
        await contract.submitTransaction(
            'UpdateOrder',
            orderID,
            userID,
            ownerID,
            startLocation,
            endLocation,
            startTime,
            miles,
            orderStatus,
            orderType,
            cost,
            rate,
            comment
        );

        console.log(`✅ Order ${orderID} updated successfully`);
    } catch (error) {
        console.error(`❌ Failed to update order: ${error}`);
    }
}
```

# 部署 & 测试

```bash
# deploy this chaincode
cd ${...}/Blockchain_NEV/blockchain/fabric-example/test-network
./network.sh up createChannel -c mychannel
./network.sh deployCC -ccn basic -ccp ../../blockchain-orders/ -ccl typescript

# run the application
cd ${...}/Blockchain_NEV/blockchain/blockchain-orders/caller_examples
npm install
npm start
```