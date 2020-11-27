// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Eth, Net} from '../modules';
import {Query} from '../Query';
import {provider} from './provider';

export * from './provider';
export const query = new Query(provider);
export const {eth, net} = query;
