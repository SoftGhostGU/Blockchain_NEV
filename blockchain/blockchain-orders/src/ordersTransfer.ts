/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Orders} from './orders';

@Info({
  title: "OrdersTransfer",
  description: "Smart contract for Car Owners' Orders Statements",
})
export class OrdersTransferContract extends Contract {
  // InitLedger adds initial orders to the ledger
  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const orders: Orders[] = [
      {
        orderID: "ORD20250717001",
        userID: 1,
        driverID: 1,
        vehicleID: 1,
        startLocation: "New York",
        destination: "Los Angeles",
        orderStatus: 0,
        estimatedPrice: 0,
        actualPrice: 0,
        createdTime: "2023-07-17T12:00:00Z",
        orderType: "Delivery",
        updatedTime: "2023-07-17T12:00:00Z",
      },
      {
        orderID: "ORD20250717002",
        userID: 2,
        driverID: 2,
        vehicleID: 2,
        startLocation: "Chicago",
        destination: "New York",
        orderStatus: 0,
        estimatedPrice: 0,
        actualPrice: 0,
        createdTime: "2023-07-17T12:00:00Z",
        orderType: "Delivery",
        updatedTime: "2023-07-17T12:00:00Z",
      },
    ];

    for (const order of orders) {
      await ctx.stub.putState(
        order.orderID,
        Buffer.from(stringify(sortKeysRecursive(order)))
      );
      console.log(`Orders ${order.orderID} initialized`);
    }

    for (const order of orders) {
      await ctx.stub.deleteState(order.orderID);
      console.log(`Order ${order.orderID} deleted`);
    }

    console.log("Orders Ledger initialized");
  }

  // CreateOrder creates a new order with given details
  @Transaction()
  public async CreateOrder(
    ctx: Context,
    orderID: string,
    userID: number,
    driverID: number,
    vehicleID: number,
    startLocation: string,
    destination: string,
    orderStatus: number,
    estimatedPrice: number,
    actualPrice: number,
    createdTime: string,
    orderType: string,
    updatedTime: string
  ): Promise<void> {
    const exists = await this.OrderExists(ctx, orderID);
    if (exists) {
      throw new Error(`The order ${orderID} already exists`);
    }

    const order: Orders = {
      orderID: orderID,
      userID: userID,
      driverID: driverID,
      vehicleID: vehicleID,
      startLocation: startLocation,
      destination: destination,
      orderStatus: orderStatus,
      estimatedPrice: estimatedPrice,
      actualPrice: actualPrice,
      createdTime: createdTime,
      orderType: orderType,
      updatedTime: updatedTime,
    };

    await ctx.stub.putState(
      orderID,
      Buffer.from(stringify(sortKeysRecursive(order)))
    );
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
    userID: number,
    driverID: number,
    vehicleID: number,
    startLocation: string,
    destination: string,
    orderStatus: number,
    estimatedPrice: number,
    actualPrice: number,
    createdTime: string,
    orderType: string,
    updatedTime: string
  ): Promise<void> {
    const exists = await this.OrderExists(ctx, orderID);
    if (!exists) {
      throw new Error(`The order ${orderID} does not exist`);
    }

    const UpdateOrder: Orders = {
      orderID: orderID,
      userID: userID,
      driverID: driverID,
      vehicleID: vehicleID,
      startLocation: startLocation,
      destination: destination,
      orderStatus: orderStatus,
      estimatedPrice: estimatedPrice,
      actualPrice: actualPrice,
      createdTime: createdTime,
      orderType: orderType,
      updatedTime: updatedTime,
    };

    await ctx.stub.putState(
      orderID,
      Buffer.from(stringify(sortKeysRecursive(UpdateOrder)))
    );
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
  @Returns("boolean")
  public async OrderExists(ctx: Context, orderID: string): Promise<boolean> {
    const orderJSON = await ctx.stub.getState(orderID);
    return orderJSON.length > 0;
  }

  // This function seems useless and has logical error
  // TransferOrder transfers ownership of an order with given orderID to a new owner with given newOwnerID
  //   @Transaction()
  //   public async TransferOrder(
  //     ctx: Context,
  //     orderID: string,
  //     newOwnerID: string
  //   ): Promise<void> {
  //     const orderJSON = await ctx.stub.getState(orderID);
  //     const order: Orders = JSON.parse(orderJSON.toString()) as Orders;
  //     order.orderID = newOwnerID;

  //     await ctx.stub.putState(
  //       orderID,
  //       Buffer.from(stringify(sortKeysRecursive(order)))
  //     );
  //     console.log(`Order ${orderID} transferred to ${newOwnerID}`);
  //   }

  // QueryAllOrders returns all orders in the ledger
  @Transaction(false)
  @Returns("string")
  public async QueryAllOrders(ctx: Context): Promise<string> {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange("", "");

    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue) as Orders;
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
