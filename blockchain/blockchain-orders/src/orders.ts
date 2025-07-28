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
