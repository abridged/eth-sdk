import { Eth, Net } from '../modules';
import { Query } from '../Query';
import { provider } from './provider';

export * from './provider';
export const query = new Query(provider);
export const {
  eth,
  net,
} = query;
