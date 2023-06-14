export interface PreviousHashStore {
  keyPrefix?: string
  getItem(address: string): string | null | Promise<string | null>
  removeItem(address: string): void | Promise<void>
  setItem(address: string, previousHash: string): void | Promise<void>
}
