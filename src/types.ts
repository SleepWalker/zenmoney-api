/**
 * @see https://github.com/zenmoney/ZenPlugins/wiki/ZenMoney-API
 */

export interface AuthData {
  accessToken: string;
  tokenType: 'bearer';
  expiresIn: number; // seconds,
  refreshToken: string;
}

export type UnixTimestamp = number;

/**
 * System entities (read only)
 */

/**
 * Currency data and rates
 */
export interface Instrument {
  id: number;
  title: string;
  shortTitle: string; // 'USD'
  symbol: string; // '$'
  rate: number; // float
  changed: UnixTimestamp;
}

/**
 * Bank or any other payment company that may control some financial accounts
 */
export interface Company {
  id: number;
  title: string;
  fullTitle: string;
  www: string;
  country: string;
  changed: UnixTimestamp;
}

export interface Country {
  id: number;
  title: string;
  domain: string; // 'ru' | 'ua' | 'us'
  currency: Instrument['id'];
}

export interface User {
  id: number;
  login: string | null;

  /**
   * Main user's currency. It will be used for calculations
   * and reports inside system
   */
  currency: Instrument['id'];

  /**
   * Parent (admin) user id for the family family accounting.
   * This user can control which user can be in family.
   * Parent user has parent === null
   */
  parent: User['id'] | null;
  changed: UnixTimestamp;
}

/**
 * User entities (can be edited through API)
 */

export interface Account {
  id: string; // UUID
  changed: UnixTimestamp;
  user: User['id'];
  role: User['id'] | null;
  instrument: Instrument['id'] | null;
  company: Company['id'] | null;
  type: 'cash' | 'ccard' | 'checking' | 'loan' | 'deposit' | 'emoney' | 'debt';
  title: string;
  /**
   * An array of the last 4 digits of the corresponding bank cards or account numbers
   */
  syncID: string[] | null;

  /**
   * Current account balance
   */
  balance: number | null;

  /**
   * Account balance (or loan body) on opening date
   */
  startBalance: number | null;

  /**
   * Credit limit for ccard
   *
   * @return  {[type]}  [return description]
   */
  creditLimit: number | null; // >= 0

  inBalance: boolean;
  savings: boolean | null;

  /**
   * Whether this account's balance should be corrected based on SMS data
   */
  enableCorrection: boolean;
  enableSMS: boolean;
  archive: boolean;

  // All next fields may be null in case
  // for all account types except 'loan' and 'deposit'
  capitalization: boolean;
  percent: number; // >= 0 && < 100
  startDate: string; // 'yyyy-MM-dd'
  endDateOffset: number;
  endDateOffsetInterval: 'day' | 'week' | 'month' | 'year';
  payoffStep: number | null;
  payoffInterval: 'month' | 'year' | null;
}

/**
 * Category is named Tag in an official documentation
 */
export interface Category {
  id: string; // UUID
  user: User['id'];

  title: string;
  /**
   * Parent category. It is allowed only 1 level nesting
   */
  parent: Category['id'] | null;
  /**
   * Icon id
   */
  icon: string | null;
  /**
   * Icon color
   *
   * @return  {[type]}  [return description]
   */
  color: number | null;
  /**
   * Icon picture url
   *
   * Calculation:
   * alpha, red, green, blue 0 <= 255.
   * unsigned long color = (a << 24) + (r << 16) + (g << 8) + (b << 0)
   */
  picture: string | null;

  showIncome: boolean;
  showOutcome: boolean;
  /**
   * Whether category is taking part in income budget
   */
  budgetIncome: boolean;
  /**
   * Whether category is taking part in outcome budget
   */
  budgetOutcome: boolean;
  /**
   * Whether expenses in this category are required.
   * `true` or `null` means required
   */
  required: boolean | null;

  changed: UnixTimestamp;
}

/**
 * The Merchant of operation
 *
 * Unlike operation payee merchant is stored and than can be suggested during
 * transaction creation. Is also listed on payee and payer page
 */
export interface Merchant {
  id: string; // UUID
  user: User['id'];
  title: string;
  changed: UnixTimestamp;
}

interface TransactionSpecification {
  incomeInstrument: Instrument['id'];
  incomeAccount: Account['id'];
  income: number; // >= 0
  outcomeInstrument: Instrument['id'];
  outcomeAccount: Account['id'];
  outcome: number; // >= 0
}

interface ReminderBase extends TransactionSpecification {
  id: string; // UUID
  user: User['id'];

  tag: Category['id'][] | null;
  merchant: Merchant['id'] | null;
  payee: string | null;
  comment: string | null;

  notify: boolean;

  changed: UnixTimestamp;
}

/**
 * Reminder operation settings
 *
 * @see https://github.com/zenmoney/ZenPlugins/wiki/ZenMoney-API#reminder
 */
export interface Reminder extends ReminderBase {
  /**
   * Repeatability interval. `null` if transaction does not repeat
   */
  interval: 'day' | 'week' | 'month' | 'year' | null;
  /**
   * The step size of interval. E.g. 2 days
   */
  step: number | null; // >= 0
  /**
   * The points inside step, where reminders are created
   */
  points: number[] | null; // >= 0 && < step
  /**
   * Reminder start date
   */
  startDate: string; // 'yyyy-MM-dd'
  /**
   * Reminder end date (inclusive).
   * If `null` — repeat forever
   */
  endDate: string | null; // 'yyyy-MM-dd'
}

/**
 * Actual reminder operation that was created based on Reminder configuration
 */
export interface ReminderMarker extends ReminderBase {
  reminder: Reminder['id'];

  /**
   * planned - planned operation
   * processed - completed operation (transaction was created)
   * deleted - the reminder marker was deleted
   */
  state: 'planned' | 'processed' | 'deleted';
  date: string; // 'yyyy-MM-dd'
}

export interface Transaction extends TransactionSpecification {
  id: string; // UUID
  user: User['id'];
  deleted: boolean;
  hold: boolean | null;

  tag: Category['id'][] | null;
  merchant: Merchant['id'] | null;
  payee: string | null;
  originalPayee: string | null;
  comment: string | null;

  date: string; // 'yyyy-MM-dd'

  mcc: number | null;

  reminderMarker: ReminderMarker['id'] | null;

  opIncome: number | null; // >= 0
  opIncomeInstrument: Instrument['id'] | null;
  opOutcome: number | null; // >= 0
  opOutcomeInstrument: Instrument['id'] | null;

  latitude: number | null; // >= -90  && <= 90
  longitude: number | null; // >= -180 && <= 180

  changed: UnixTimestamp;
  created: UnixTimestamp;
}

/**
 * Budget for the month
 *
 * NOTE: To remove a budget for specified month you need to set lock to false
 * and set outcome/income to zero
 */
export interface Budget {
  user: User['id'];

  /**
   * Budget category.
   * If `null` — uncategorized operations
   * If '00000000-0000-0000-0000-000000000000' — total budget for month
   */
  tag: Category['id'] | null | '00000000-0000-0000-0000-000000000000';
  date: string; // 'yyyy-MM-dd'

  income: number;
  /**
   * If `true` — means that income summ also includes all planned operations
   */
  incomeLock: boolean;
  outcome: number;
  /**
   * If `true` — means that outcome summ also includes all planned operations
   */
  outcomeLock: boolean;

  changed: UnixTimestamp;
}

export type EntityName =
  | 'instrument'
  | 'country'
  | 'company'
  | 'user'
  | 'account'
  | 'tag'
  | 'budget'
  | 'merchant'
  | 'reminder'
  | 'reminderMarker'
  | 'transaction';

export interface DiffObject {
  /**
   * The time on a client for time correction
   */
  currentClientTimestamp?: UnixTimestamp;

  /**
   * The time of the last synchronization
   * To start sync from scratch — set `0`
   *
   * You should save this value from API response to use during the next sync
   */
  serverTimestamp?: UnixTimestamp;

  /**
   * Which entities should the server return as of it was the initial sync
   */
  forceFetch?: EntityName[];

  instrument?: Instrument[];
  country?: Country[];
  company?: Company[];
  user?: User[];
  account?: Account[];
  tag?: Category[];
  budget?: Budget[];
  merchant?: Merchant[];
  reminder?: Reminder[];
  reminderMarker?: ReminderMarker[];
  transaction?: Transaction[];

  deletion?: {
    id: string; // entity id
    object: EntityName;
    stamp: number;
    user: number;
  }[];
}
