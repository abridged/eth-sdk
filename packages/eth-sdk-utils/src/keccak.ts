// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {keccak_256} from 'js-sha3';
import {toBuffer} from './buffer';
import {HEX_PREFIX} from './constants';
import {TData} from './types';
import {concatHex} from './hex';

export function keccak256(...messages: TData[]): string {
  return `${HEX_PREFIX}${keccak_256(toBuffer(concatHex(...messages)))}`;
}
