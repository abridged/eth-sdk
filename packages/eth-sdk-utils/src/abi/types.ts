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
