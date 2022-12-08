import { AbstractNode } from '@xyo-network/node'

export abstract class PayloadTransport {
  constructor(protected readonly node: AbstractNode) {}
}
