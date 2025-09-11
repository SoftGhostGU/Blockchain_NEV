/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class ModelParams {
    @Property()
    public modelID: string = '';   // 唯一ID，比如 clientID+round

    @Property()
    public clientID: string = '';  // 客户端ID

    @Property()
    public round: number = 0;      // 训练轮次

    @Property()
    public weights: string = '';   // 模型权重（JSON字符串）

    @Property()
    public timestamp: string = ''; // 上传时间
}
