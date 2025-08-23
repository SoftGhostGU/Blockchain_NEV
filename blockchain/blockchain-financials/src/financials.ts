/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

export enum TransactionTYPE {
    Expenses = 'Expenses',
    Withdrawal = 'Withdrawal',
    Earnings = 'Earnings',
    Recharge = 'Recharge',
}

@Object()
export class Financials {
    @Property()
    public FinancialsID: string = '';

    @Property()
    public CarOwnerID: string = '';

    @Property()
    public Role: string = '';

    @Property()
    public TransactionType: TransactionTYPE = TransactionTYPE.Expenses;

    @Property()
    public Amount: number = 0;

    @Property()
    public TradingMoment: number = 0; // timestamp
}
