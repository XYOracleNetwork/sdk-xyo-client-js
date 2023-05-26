import { PreviousHashStore } from '@xyo-network/core'

export class MongoDBPreviousHashStore implements PreviousHashStore {
  getItem(key: string): string | null | Promise<string | null> {
    throw new Error('Method not implemented.')
  }
  removeItem(key: string): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
  setItem(key: string, value: string): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}
