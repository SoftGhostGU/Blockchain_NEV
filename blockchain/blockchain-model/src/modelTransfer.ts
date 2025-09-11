/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Transaction, Returns} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {ModelParams} from './model';

@Info({
  title: "ModelTransfer",
  description: "Smart contract for Federated Learning Model Management",
})
export class ModelTransferContract extends Contract {

  // 上传模型参数
  @Transaction()
  public async SubmitModel(
    ctx: Context,
    modelID: string,
    clientID: string,
    round: number,
    weights: string,
    timestamp: string
  ): Promise<void> {
    const exists = await this.ModelExists(ctx, modelID);
    if (exists) {
      throw new Error(`Model ${modelID} already exists`);
    }

    const model: ModelParams = {
      modelID,
      clientID,
      round,
      weights,
      timestamp,
    };

    const encoder = new TextEncoder();
    await ctx.stub.putState(
      modelID,
      encoder.encode(stringify(sortKeysRecursive(model)))
    );
    console.log(`Model ${modelID} submitted by client ${clientID}`);
  }

  // 聚合同一轮次的模型参数（简单平均）
  @Transaction()
  public async AggregateModels(ctx: Context, round: number): Promise<string> {
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();

    let models: ModelParams[] = [];
    while (!result.done) {
      const strValue = result.value.value.toString();
      const record: ModelParams = JSON.parse(strValue);
      if (record.round === round) {
        models.push(record);
      }
      result = await iterator.next();
    }

    if (models.length === 0) {
      throw new Error(`No models found for round ${round}`);
    }

    // 假设权重是 JSON 数组，比如 "[0.1, 0.2, 0.3]"
    const parsedWeights = models.map(m => JSON.parse(m.weights));
    const length = parsedWeights[0].length;
    let aggregated = new Array(length).fill(0);

    for (let w of parsedWeights) {
      for (let i = 0; i < length; i++) {
        aggregated[i] += w[i];
      }
    }
    aggregated = aggregated.map(v => v / models.length);

    const globalModelID = `global_${round}`;
    const globalModel: ModelParams = {
      modelID: globalModelID,
      clientID: "global",
      round,
      weights: JSON.stringify(aggregated),
      timestamp: new Date().toISOString(),
    };

    const encoder = new TextEncoder();
    await ctx.stub.putState(
      globalModelID,
      encoder.encode(stringify(sortKeysRecursive(globalModel)))
    );

    console.log(`Global model for round ${round} aggregated`);
    return JSON.stringify(globalModel);
  }

  // 查询某个模型
  @Transaction(false)
  public async QueryModel(ctx: Context, modelID: string): Promise<string> {
    const modelJSON = await ctx.stub.getState(modelID);
    if (modelJSON.length === 0) {
      throw new Error(`Model ${modelID} does not exist`);
    }
    return modelJSON.toString();
  }

  // 查询某个客户端的所有模型
  @Transaction(false)
  @Returns("string")
  public async QueryClientModels(ctx: Context, clientID: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();

    const allResults: ModelParams[] = [];
    while (!result.done) {
      const strValue = result.value.value.toString();
      const record: ModelParams = JSON.parse(strValue);
      if (record.clientID === clientID) {
        allResults.push(record);
      }
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }

  // 判断模型是否存在
  @Transaction(false)
  @Returns("boolean")
  public async ModelExists(ctx: Context, modelID: string): Promise<boolean> {
    const modelJSON = await ctx.stub.getState(modelID);
    return modelJSON.length > 0;
  }
}
