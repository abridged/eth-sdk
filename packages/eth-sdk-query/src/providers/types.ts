// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {IProviderExtension} from './interfaces';

export type TProviderRawExtension = (
  method: string,
  params: any[],
) => Promise<any>;
export type TProviderExtension = TProviderRawExtension | IProviderExtension;
