import { createNodeWorker } from './createNodeWorker'
import { PayloadHasher } from './PayloadHasher'

PayloadHasher.createNodeWorker = createNodeWorker

export class NodePayloadHasher extends PayloadHasher {
  static override createNodeWorker = createNodeWorker
}
