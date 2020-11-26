// Copyright Abridged Inc. 2019. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import BN from 'bn.js';

export type TData = string | Buffer;
export type TQuantity = number | string | BN;
export type TTag = 'latest' | 'earliest' | 'pending';
export type TTagOrQuantity = TTag | TQuantity;
