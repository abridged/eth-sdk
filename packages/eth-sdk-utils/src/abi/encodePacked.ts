// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {concatHex} from '../hex';
import {IEncodedArg} from './interfaces';
import {TEncodedPackedArg} from './types';
import {encodeArg, detectArgType} from './encodeHelpers';

export function encodePacked(...args: TEncodedPackedArg[]): string {
  const preparedArgs: IEncodedArg[] = [];

  for (const arg of args) {
    let preparedArg: IEncodedArg = null;

    if (arg && typeof arg === 'object') {
      if (arg.type && arg.value) {
        preparedArg = arg;
      } else if (arg.t && arg.v) {
        const {t: type, v: value} = arg;
        preparedArg = {
          type,
          value,
        };
      }
    }

    if (!preparedArg) {
      const type = detectArgType(arg);

      if (type) {
        preparedArg = {
          type,
          value: arg,
        };
      }
    }

    if (preparedArg) {
      preparedArgs.push(preparedArg);
    } else {
      throw new Error('unsupported encodePacked arg');
    }
  }

  return concatHex(...preparedArgs.map(param => encodeArg(param, true)));
}
