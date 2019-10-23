import { IQuery } from './interfaces';

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
