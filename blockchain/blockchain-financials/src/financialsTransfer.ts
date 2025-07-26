/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Financials, TransactionTYPE} from './financials';

@Info({title: 'FinancialsTransfer', description: 'Smart contract for Car Owners\' Financials Statements'})
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const financials: Financials[] = [
            {
                FinancialsID: '1',
                CarOwnerID: '1',
                TransactionType: TransactionTYPE.Deposit,
                Amount: 1000,
                TradingMoment: 0,
            },
            {
                FinancialsID: '2',
                CarOwnerID: '1',
                TransactionType: TransactionTYPE.Earnings,
                Amount: 500,
                TradingMoment: 60,
            },
        ]

        for (const finan of financials) {
            await ctx.stub.putState(finan.FinancialsID, Buffer.from(stringify(sortKeysRecursive(finan))));
            console.log(`Financials ${finan.FinancialsID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, financialId: string, carOwnerId: string, transactionType: TransactionTYPE, amount: number, tradingMoment: number): Promise<void> {
        const exists = await this.AssetExists(ctx, financialId);
        if (exists) {
            throw new Error(`The financial ${financialId} already exists`);
        }

        const finan: Financials = {
            FinancialsID: financialId,
            CarOwnerID: carOwnerId,
            TransactionType: transactionType,
            Amount: amount,
            TradingMoment: tradingMoment
        };

        await ctx.stub.putState(financialId, Buffer.from(stringify(sortKeysRecursive(finan))));
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, financialId: string): Promise<string> {
        const finanJSON = await ctx.stub.getState(financialId);
        if (finanJSON.length === 0) {
            throw new Error(`The financial ${financialId} does not exist`);
        }
        return finanJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, financialId: string, carOwnerId: string, transactionType: TransactionTYPE, amount: number, tradingMoment: number): Promise<void> {
        const exists = await this.AssetExists(ctx, financialId);
        if (!exists) {
            throw new Error(`The financial ${financialId} does not exist`);
        }

        const updatedFinancial: Financials = {
            FinancialsID: financialId,
            CarOwnerID: carOwnerId,
            TransactionType: transactionType,
            Amount: amount,
            TradingMoment: tradingMoment
        }

        return ctx.stub.putState(financialId, Buffer.from(stringify(sortKeysRecursive(updatedFinancial))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, financialId: string): Promise<void> {
        const exists = await this.AssetExists(ctx, financialId);
        if (!exists) {
            throw new Error(`The financial ${financialId} does not exist`);
        }
        return ctx.stub.deleteState(financialId);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, financialId: string): Promise<boolean> {
        const finanJSON = await ctx.stub.getState(financialId);
        return finanJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferAsset(ctx: Context, financialId: string, newOwner: string): Promise<string> {
        const finanString = await this.ReadAsset(ctx, financialId);
        const financial = JSON.parse(finanString) as Financials;
        const oldOwner = financial.CarOwnerID;
        financial.CarOwnerID = newOwner;
        await ctx.stub.putState(financialId, Buffer.from(stringify(sortKeysRecursive(financial))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
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
