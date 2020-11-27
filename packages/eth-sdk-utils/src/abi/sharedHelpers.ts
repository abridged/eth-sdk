// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TType} from './types';

export function parseType(
  mainType: TType,
): {
  type: TType;
  bytes: number;
} {
  let type: TType = null;
  let bytes: number = null;

  if (mainType.startsWith('bytes')) {
    bytes = parseInt(mainType.replace('bytes', ''), 10);
    type = 'bytes';
  } else if (mainType.startsWith('uint')) {
    bytes = parseInt(mainType.replace('uint', ''), 10) / 8;
    type = 'uint';
  }

  return {
    type,
    bytes,
  };
}
