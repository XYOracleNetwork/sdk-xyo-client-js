import { Promisable } from '@xyo-network/promise'

export interface ModuleIdentifier {
  address?: string
  schema?: string
}

export interface Node {
  attach(address: string): void
  attached(): Promisable<string[]>
  detach(address: string): void
  registered(): Promisable<string[]>
}
