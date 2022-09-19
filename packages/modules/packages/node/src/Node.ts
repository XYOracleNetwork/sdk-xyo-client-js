import { Promisable } from '@xyo-network/promise'

export interface Node {
  attach(address: string): void
  detatch(address: string): void
  registered(): Promisable<string[]>
  attached(): Promisable<string[]>
}
