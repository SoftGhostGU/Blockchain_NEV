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
        return Shim.success();
    }

    // query order by id
    public async Query(stub: ChaincodeStub, args: string[]): Promise<any> {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }

        let id = args[0];
        let order = await stub.getState(id);
        if (!order) {
            throw new Error(`Order ${id} does not exist`);
        } else {
            return Shim.success(order);
        }
    }

}
