// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {concatHex, getHexBytesSize, toHex, padHexLeft} from '../hex';
import {IItemParam} from './interfaces';
import {encodeArg} from './encodeHelpers';

export function encode(params: IItemParam[], args: any[]): string {
  let result: string = null;

  if (params.length === args.length) {
    const parts: string[] = [];
    const dynamicParts: string[] = [];

    let offset = params.length * 32;

    for (let i = 0; i < params.length; i += 1) {
      const {type} = params[i];
      const value = args[i];
      const encoded = encodeArg(
        {
          type,
          value,
        },
        false,
      );

      if (type === 'string' || type === 'bytes' || type.endsWith('[]')) {
        parts.push(padHexLeft(toHex(offset), 32));

        dynamicParts.push(encoded);
        offset += getHexBytesSize(encoded);
      } else {
        parts.push(encoded);
      }
    }

    result = concatHex(...parts, ...dynamicParts);
  }

  return result;
}
