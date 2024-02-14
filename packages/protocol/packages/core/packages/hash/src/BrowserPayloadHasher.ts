import { createBrowserWorker } from './createBrowserWorker'
import { createNodeWorker } from './createNodeWorker'
import { PayloadHasher } from './PayloadHasher'

// We put both in here so that things will work in jsdom/jest

PayloadHasher.createBrowserWorker = createBrowserWorker
PayloadHasher.createNodeWorker = createNodeWorker

export class BrowserPayloadHasher extends PayloadHasher {
  static override createBrowserWorker = createBrowserWorker
  static override createNodeWorker = createNodeWorker
  static override jsHashWorkerUrl = (() => {
    try {
      return new URL('worker/jsHash-bundle.js', import.meta.url)
    } catch {
      return
    }
  })()
  static override subtleHashWorkerUrl = (() => {
    try {
      return new URL('worker/subtleHash-bundle.js', import.meta.url)
    } catch {
      return
    }
  })()
  static override wasmHashWorkerUrl = (() => {
    try {
      return new URL('worker/wasmHash-bundle.js', import.meta.url)
    } catch {
      return
    }
  })()
}
