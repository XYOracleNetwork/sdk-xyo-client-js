import { EmptyObject } from '@xylabs/object'

import { createNodeWorker } from './createNodeWorker.ts'
import { ObjectHasher } from './ObjectHasher.ts'

ObjectHasher.createNodeWorker = createNodeWorker

export class NodeObjectHasher<T extends EmptyObject = EmptyObject> extends ObjectHasher<T> {
  static override readonly createNodeWorker = createNodeWorker
}

/** @deprecated use NodeObjectHasher instead */
export class NodePayloadHasher<T extends EmptyObject = EmptyObject> extends NodeObjectHasher<T> {}
