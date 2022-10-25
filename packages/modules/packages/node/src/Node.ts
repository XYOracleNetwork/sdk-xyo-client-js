import { Promisable } from '@xyo-network/promise'

export interface Node {
  attach(address: string): void
  attached(): Promisable<string[]>
  detach(address: string): void
  registered(): Promisable<string[]>
}
