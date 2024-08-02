import { createBrowserWorker } from './createBrowserWorker.ts'
import { createNodeWorker } from './createNodeWorker.ts'
import { PayloadHasher } from './PayloadHasher.ts'

// We put both in here so that things will work in jsdom/jest

PayloadHasher.createBrowserWorker = createBrowserWorker
PayloadHasher.createNodeWorker = createNodeWorker

export class BrowserPayloadHasher extends PayloadHasher {
  static override createBrowserWorker = createBrowserWorker
  static override createNodeWorker = createNodeWorker
  static override subtleHashWorkerUrl = (() => {
    try {
      return new URL('worker/subtleHash-bundle.ts', import.meta.url)
    } catch {
      return
    }
  })()
  static override wasmHashWorkerUrl = (() => {
    try {
      return new URL('worker/wasmHash-bundle.ts', import.meta.url)
    } catch {
      return
    }
  })()
}
