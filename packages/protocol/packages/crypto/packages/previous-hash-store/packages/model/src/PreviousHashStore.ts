import type { Address, Hash } from '@xylabs/sdk-js'

export interface PreviousHashStore {
  getItem(address: Address): Hash | null | Promise<Hash | null>
  removeItem(address: Address): void | Promise<void>
  setItem(address: Address, previousHash: Hash): void | Promise<void>
}
