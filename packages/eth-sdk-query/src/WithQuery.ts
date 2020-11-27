// Copyright Abridged Inc. 2019,2020. All Rights Reserved.
// Node module: @eth-sdk/query
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {IQuery} from './interfaces';

export abstract class WithQuery {
  private currentQuery: IQuery = null;

  protected constructor(query: IQuery) {
    this.currentQuery = query;
  }

  public get query(): IQuery {
    if (!this.currentQuery) {
      throw new Error('undefined query');
    }

    return this.currentQuery;
  }

  public set query(query: IQuery) {
    this.currentQuery = query;
  }
}
