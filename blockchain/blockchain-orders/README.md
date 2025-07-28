# 总体说明

+ `./caller_examples/src/app.ts` 为使用ts连接fabric账本，并通过chaincode提供的函数管理账本上的数据的代码
+ `./src` 中 
    + `financials.ts` 定义了账本上存储的数据结构
    + `financialsTransfer.ts` 提供了操作账本的函数

# chaincode描述 

> 账本存储的数据结构

```typescript
export enum TransactionTYPE {
    Deposit = 'Deposit',
    Withdrawal = 'Withdrawal',
    Earnings = 'Earnings',
}

/** 账本数据结构
 * {
 *  财务id，
 *  车主id，
 *  交易类型（枚举类型，但是不是很方便，考虑改用string），
 *  交易金额，
 *  交易时间（使用时间戳，所以是一个number），
 * }
 */
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
```

> 操作账本的函数

```ts
@Transaction()
public async InitLedger(ctx: Context): Promise<void>

// CreateAsset issues a new asset to the world state with given details.
@Transaction()
public async CreateAsset(ctx: Context, financialId: string, carOwnerId: string, transactionType: TransactionTYPE, amount: number, tradingMoment: number): Promise<void>

// ReadAsset returns the asset stored in the world state with given id.
@Transaction(false)
public async ReadAsset(ctx: Context, financialId: string): Promise<string>

// UpdateAsset updates an existing asset in the world state with provided parameters.
@Transaction()
public async UpdateAsset(ctx: Context, financialId: string, carOwnerId: string, transactionType: TransactionTYPE, amount: number, tradingMoment: number): Promise<void>

// DeleteAsset deletes an given asset from the world state.
@Transaction()
public async DeleteAsset(ctx: Context, financialId: string): Promise<void>

// AssetExists returns true when asset with given ID exists in world state.
@Transaction(false)
@Returns('boolean')
public async AssetExists(ctx: Context, financialId: string): Promise<boolean>

// TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
@Transaction()
public async TransferAsset(ctx: Context, financialId: string, newOwner: string): Promise<string>

// GetAllAssets returns all assets found in the world state.
@Transaction(false)
@Returns('string')
public async GetAllAssets(ctx: Context): Promise<string>
```

> 使用 ts 调用 **操作账本的函数** 对账本进行操作

```ts
async function initLedger(contract: Contract): Promise<void> {
    // 使用 submitTransaction() 调用函数
    await contract.submitTransaction('InitLedger');
}

async function createAsset(contract: Contract): Promise<void> {
    // 使用 , 分割来传递函数的参数
    await contract.submitTransaction(
        'CreateAsset',
        financialID,
        carOwnerID,
        'Deposit',
        '1300',
        '6000',
    );
}

async function transferAssetAsync(contract: Contract): Promise<void> {
    // 使用 argument
    const commit = await contract.submitAsync('TransferAsset', {
        arguments: [financialID, `${String(Date.now() + 15)}`],
    });
    // 函数可以返回结果
    const oldOwner = utf8Decoder.decode(commit.getResult());
}
```

# 部署 & 测试

```bash
# deploy this chaincode
cd ${...}/Blockchain_NEV/blockchain/fabric-example/test-network
./network.sh up createChannel -c mychannel
./network.sh deployCC -ccn basic -ccp ../../blockchain-financials/ -ccl typescript

# run the application
cd ${...}/Blockchain_NEV/blockchain/blockchain-financials/caller_examples
npm install
npm start
```