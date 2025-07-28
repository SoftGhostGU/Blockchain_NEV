/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Orders, OrderStatusType} from './orders';

@Info({title: 'OrdersTransfer', description: 'Smart contract for Car Owners\' Orders Statements'})
export class AssetTransferContract extends Contract {

    // InitLedger adds initial orders to the ledger
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const orders: Orders[] = [
            {
                orderID: 'ORD20250717001',
                userID: 1,
                ownerID: 2,
                startLocation: '北京市海淀区中关村',
                endLocation: '北京市海淀区北三环',
                startTime: '2025-07-17T10:00:00Z',
                miles: '1000',
                orderStatus: OrderStatusType.COMPLETED,
                orderType: '网约车',
                cost: 180,
                rate: 5,
                comment: '好！'
            },
            {
                orderID: 'ORD20250717002',
                userID: 3,
                ownerID: 4,
                startLocation: '上海市浦东新区陆家嘴',
                endLocation: '上海市杨浦区五角场',
                startTime: '2025-07-17T11:00:00Z',
                miles: '900',
                orderStatus: OrderStatusType.ACCEPTED,
                orderType: '网约车',
                cost: 120,
                rate: 4.8,
                comment: '不错！'
            }
        ]

        for (const order of orders) {
            await ctx.stub.putState(order.orderID, Buffer.from(stringify(sortKeysRecursive(order))));
            console.log(`Orders ${order.orderID} initialized`);
        }
    }

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
    ): Promise<void> {
        const exists = await this.OrderExists(ctx, orderID);
        if (exists) {
            throw new Error(`The order ${orderID} already exists`);
        }

        const order: Orders = {
            orderID: orderID,
            userID: Number(userID),
            ownerID: Number(ownerID),
            startLocation: startLocation,
            endLocation: endLocation,
            startTime: startTime,
            miles: miles,
            orderStatus: orderStatus,
            orderType: orderType,
            cost: Number(cost),
            rate: Number(rate),
            comment: comment
        }

        await ctx.stub.putState(orderID, Buffer.from(stringify(sortKeysRecursive(order))));
        console.log(`Order ${orderID} created`);
    }

    // QueryOrder returns the details of an order with given orderID
    @Transaction()
    public async QueryOrder(ctx: Context, orderID: string) {
        const orderJSON = await ctx.stub.getState(orderID);

        if (orderJSON.length === 0) {
            throw new Error(`Order ${orderID} does not exist`);
        }

        return orderJSON.toString();
    }

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
    ): Promise<void> {
        const exists = await this.OrderExists(ctx, orderID);
        if (!exists) {
            throw new Error(`The order ${orderID} does not exist`);
        }

        const UpdateOrder: Orders = {
            orderID: orderID,
            userID: Number(userID),
            ownerID: Number(ownerID),
            startLocation: startLocation,
            endLocation: endLocation,
            startTime: startTime,
            miles: miles,
            orderStatus: orderStatus,
            orderType: orderType,
            cost: Number(cost),
            rate: Number(rate),
            comment: comment
        }

        await ctx.stub.putState(orderID, Buffer.from(stringify(sortKeysRecursive(UpdateOrder))));
        console.log(`Order ${orderID} updated`);
    }

    // DeleteOrder deletes an order with given orderID
    @Transaction()
    public async DeleteOrder(ctx: Context, orderID: string): Promise<void> {
        const exists = await this.OrderExists(ctx, orderID);
        if (!exists) {
            throw new Error(`The order ${orderID} does not exist`);
        }

        await ctx.stub.deleteState(orderID);
        console.log(`Order ${orderID} deleted`);
    }

    // OrderExists returns true if an order with given orderID exists in the ledger
    @Transaction(false)
    @Returns('boolean')
    public async OrderExists(ctx: Context, orderID: string): Promise<boolean> {
        const orderJSON = await ctx.stub.getState(orderID);
        return orderJSON && orderJSON.length > 0;
    }

    // TransferOrder transfers ownership of an order with given orderID to a new owner with given newOwnerID
    @Transaction()
    public async TransferOrder(ctx: Context, orderID: string, newOwnerID: string): Promise<void> {
        const orderJSON = await ctx.stub.getState(orderID);
        if (!orderJSON || orderJSON.length === 0) {
            throw new Error(`Order ${orderID} does not exist`);
        }

        const order: Orders = JSON.parse(orderJSON.toString());
        order.ownerID = Number(newOwnerID);

        await ctx.stub.putState(orderID, Buffer.from(stringify(sortKeysRecursive(order))));
        console.log(`Order ${orderID} transferred to ${newOwnerID}`);
    }

    // QueryAllOrders returns all orders in the ledger
    @Transaction(false)
    @Returns('string')
    public async QueryAllOrders(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }

        return JSON.stringify(allResults);
    }

}
