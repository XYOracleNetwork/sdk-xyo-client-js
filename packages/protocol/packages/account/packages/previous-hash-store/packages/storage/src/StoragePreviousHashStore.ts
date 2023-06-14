import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'

export class StoragePreviousHashStore implements PreviousHashStore {
  keyPrefix?: string | undefined
  getItem(address: string): string | Promise<string | null> | null {
    throw new Error('Method not implemented.')
  }
  removeItem(address: string): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
  setItem(address: string, previousHash: string): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}
