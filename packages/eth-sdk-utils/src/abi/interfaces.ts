// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TType, TItemStateMutability, TItemType} from './types';

export interface IEncodedArg<T = any> {
  type: TType;
  value: T;
}

export interface IEncodedArgShort {
  t: TType;
  v: any;
}

export interface IItem {
  constant?: boolean;
  payable?: boolean;
  stateMutability?: TItemStateMutability;
  anonymous?: boolean;
  inputs?: IItemInput[];
  name?: string;
  outputs?: IItemParam[];
  type: TItemType;
}

export interface IItemParam {
  name: string;
  type: TType;
}

export interface IItemInput extends IItemParam {
  indexed?: boolean;
}

export interface IDecoded {
  [key: string]: any;
  [key: number]: any;
  length?: number;
}
