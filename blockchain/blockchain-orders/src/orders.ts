/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Orders {
    @Property()
    public orderID: string = '';

    @Property()
    public userID: number = 0;

    @Property()
    public driverID: number = 0;

    @Property()
    public vehicleID: number = 0;

    @Property()
    public startLocation: string = '';

    @Property()
    public destination: string = '';
    
    @Property()
    public orderStatus: number = 0;

    @Property()
    public estimatedPrice: number = 0;

    @Property()
    public actualPrice: number = 0;

    @Property()
    public createdTime: string = '';
    
    @Property()
    public orderType: string = '';
    
    @Property()
    public updatedTime: string = '';
}
