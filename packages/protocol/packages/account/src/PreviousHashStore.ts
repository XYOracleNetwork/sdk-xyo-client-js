export interface PreviousHashStore {
  keyPrefix?: string
  getItem(key: string): string | null | Promise<string | null>
  removeItem(key: string): void | Promise<void>
  setItem(key: string, value: string): void | Promise<void>
}
