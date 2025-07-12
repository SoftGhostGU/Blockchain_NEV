/*
 * SPDX-License-Identifier: 
 */

import { ChaincodeInterface, ChaincodeStub, Shim } from 'fabric-shim';

export class Chaincode implements ChaincodeInterface {

    public async Init(stub: ChaincodeStub): Promise<any> {
        const { fcn, params } = stub.getFunctionAndParameters();
        console.info('Init()', fcn, params);
        await this.initLedger(stub);
        return Shim.success();
    }

    public async Invoke(stub: ChaincodeStub): Promise<any> {
        const { fcn, params } = stub.getFunctionAndParameters();
        console.info('Invoke()', fcn, params);

        try {
            return await this[fcn](stub, params);
        } catch (err) {
            return Shim.error(err.toString());
        }
    }

    public async initLedger(stub: ChaincodeStub): Promise<any> {
        console.log("============= START : Initialize Ledger ============");
        const orders = [
            {
                ownerId: "1",
                orderId: "1",
                userId: "101",
                price: 100.0
            }, {
                ownerId: "2",
                orderId: "2",
                userId: "102",
                price: 200.0
            }, {
                ownerId: "3",
                orderId: "3",
                userId: "103",
                price: 300.0
            }
        ]

        for (const order of orders) {
            const orderKey = "ORDER" + order.orderId;
            const orderValue = JSON.stringify(order);
            await stub.putState(orderKey, new Uint8Array(Buffer.from(orderValue)));
            console.info(`Order ${orderKey} added to the ledger`);
        }

        console.log("============= END : Initialize Ledger ============");
    }

    // query order by id
    public async queryById(stub: ChaincodeStub, args: string[]): Promise<any> {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }

        const id = args[0];
        const order = await stub.getState(id);
        if (!order) {
            throw new Error(`Order ${id} does not exist`);
        } else {
            return Shim.success(order);
        }
    }

    // query all orders
    public async queryAll(stub: ChaincodeStub): Promise<any> {
        const iterator = await stub.getStateByRange('', ''); // 传两个空值，代表遍历所有键值对
        const allOrders: any[] = [];
        let res = await iterator.next();

        while (!res.done) {
            const order = JSON.parse(res.value.toString());
            allOrders.push(order);
            res = await iterator.next();
        }

        await iterator.close();

        console.log(`Found ${allOrders.length} orders`);
        console.log(allOrders);
        return Shim.success(Buffer.from(JSON.stringify(allOrders)));
    }

    // record order that owner accepted from user
    public async recordOrder(stub: ChaincodeStub, args: string[]) {
        // `ownerId` accept the `order(id)` from `userId` with `price`
        const ownerId = args[0];
        const orderId = args[1];
        const userId = args[2];
        const price = parseFloat(args[3]);

        const ownerBalanceBytes = await stub.getState(ownerId);
        const userBalanceBytes = await stub.getState(userId);
        let ownerBalance = parseFloat(ownerBalanceBytes.toString());
        let userBalance = parseFloat(userBalanceBytes.toString());

        if (userBalance < price) {
            throw new Error(`User ${userId} does not have enough balance to purchase order ${orderId}`);
        } else {
            ownerBalance += price;
            userBalance -= price;
            await stub.putState(ownerId, new Uint8Array(Buffer.from(ownerBalance.toString())));
            await stub.putState(userId, new Uint8Array(Buffer.from(userBalance.toString())));
        }

        return Shim.success(new Uint8Array(Buffer.from('Order purchased successfully')));
    }

}
