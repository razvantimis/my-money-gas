export type Dividend = {
  uuid: string;
  exDate: Date;
  payDate: Date;
  symbol: string;
  currency: string;
  account: string;
  exchangeCode: string;
  description: string;
  /** The tax amount associated with the dividend. */
  tax: number;
  /** The fee associated with the dividend. */
  fee: number;
  /** The quantity held prior to ex date. */
  quantity: number;
  /** The dividend per share. */
  grossRate: number;
  /** Gross Rate x Quantity. */
  grossAmount: number;
  /** Calculated by adding the tax and fee amounts and then subtracting it from the gross amount. */
  netAmount: number;
};