import { createNodeWorker } from './createNodeWorker.js'
import { PayloadHasher } from './PayloadHasher.js'

PayloadHasher.createNodeWorker = createNodeWorker

export class NodePayloadHasher extends PayloadHasher {
  static override createNodeWorker = createNodeWorker
}
