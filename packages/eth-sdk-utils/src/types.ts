import BN from 'bn.js';

export type TData = string | Buffer;
export type TQuantity = number | string | BN;
export type TTag = 'latest' | 'earliest' | 'pending';
export type TTagOrQuantity = TTag | TQuantity;
