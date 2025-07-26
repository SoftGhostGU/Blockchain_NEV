/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

export enum TransactionTYPE {
    Deposit = 'Deposit',
    Withdrawal = 'Withdrawal',
    Earnings = 'Earnings',
}

@Object()
export class Financials {
    @Property()
    public FinancialsID: string = '';

    @Property()
    public CarOwnerID: string = '';

    @Property()
    public TransactionType: TransactionTYPE = TransactionTYPE.Deposit;

    @Property()
    public Amount: number = 0;

    @Property()
    public TradingMoment: number = 0; // timestamp
}
