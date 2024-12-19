import type { EmptyObject } from '@xylabs/object'

import { createBrowserWorker } from './createBrowserWorker.ts'
import { createNodeWorker } from './createNodeWorker.ts'
import { ObjectHasher } from './ObjectHasher.ts'

ObjectHasher.createBrowserWorker = createBrowserWorker
ObjectHasher.createNodeWorker = createNodeWorker

export class BrowserObjectHasher<T extends EmptyObject = EmptyObject> extends ObjectHasher<T> {
  static override createBrowserWorker = createBrowserWorker
  static override createNodeWorker = createNodeWorker
  static override subtleHashWorkerUrl = (() => {
    try {
      return new URL('@xyo-network/hash/worker/subtleHash-bundle.mjs', import.meta.url)
    } catch {
      return
    }
  })()

  static override wasmHashWorkerUrl = (() => {
    try {
      return new URL('@xyo-network/hash/worker/wasmHash-bundle.mjs', import.meta.url)
    } catch {
      return
    }
  })()
}

/** @deprecated use BrowserObjectHasher instead */
export class BrowserPayloadHasher<T extends EmptyObject = EmptyObject> extends BrowserObjectHasher<T> {}
