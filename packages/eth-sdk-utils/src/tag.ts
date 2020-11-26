// Copyright Abridged Inc. 2019. All Rights Reserved.
// Node module: @eth-sdk/utils
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export function isTag(tag: unknown): boolean {
  let result = false;

  switch (tag) {
    case 'latest':
    case 'earliest':
    case 'pending':
      result = true;
      break;
  }

  return result;
}
