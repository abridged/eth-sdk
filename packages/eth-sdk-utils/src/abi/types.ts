// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {IEncodedArg, IEncodedArgShort, IItem} from './interfaces';

export type TType =
  | 'address'
  | 'bool'
  | 'bytes'
  | 'string'
  | 'bytes1'
  | 'bytes32'
  | 'uint'
  | 'uint8'
  | 'uint256'
  | string;

export type TEncodedPackedArg = IEncodedArg | IEncodedArgShort | any;

export type TItemStateMutability = 'pure' | 'view' | 'nonpayable' | 'payable';

export type TItemType = 'function' | 'constructor' | 'event' | 'fallback';

export type TItems = IItem[];
