/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {AssetTransferContract} from './ordersTransfer';

export const contracts: typeof Contract[] = [AssetTransferContract];
