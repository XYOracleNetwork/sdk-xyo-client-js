import { createNodeWorker } from './createNodeWorker.ts'
import { PayloadHasher } from './PayloadHasher.ts'

PayloadHasher.createNodeWorker = createNodeWorker

export class NodePayloadHasher extends PayloadHasher {
  static override createNodeWorker = createNodeWorker
}
