/*
 * SPDX-License-Identifier: 
 */

import { ChaincodeInterface, ChaincodeStub, Shim } from 'fabric-shim';

export class Chaincode implements ChaincodeInterface {

    public async Init(stub: ChaincodeStub): Promise<any> {
        const { fcn, params } = stub.getFunctionAndParameters();
        console.info('Init()', fcn, params);
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

    // query order by id
    public async Query(stub: ChaincodeStub, args: string[]): Promise<any> {
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

    // owner accept order from user
    public async acceptOrder(stub: ChaincodeStub, args: string[]) {
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
