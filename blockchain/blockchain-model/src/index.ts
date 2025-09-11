/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {ModelTransferContract} from './modelTransfer';

export const contracts: (typeof Contract)[] = [ModelTransferContract];
