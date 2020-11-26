import {IProviderExtension} from './interfaces';

export type TProviderRawExtension = (
  method: string,
  params: any[],
) => Promise<any>;
export type TProviderExtension = TProviderRawExtension | IProviderExtension;
