import { createBrowserWorker } from './createBrowserWorker'
import { createNodeWorker } from './createNodeWorker'
import { PayloadHasher } from './PayloadHasher'

// We put both in here so that things will work in jsdom/jest

PayloadHasher.createBrowserWorker = createBrowserWorker
PayloadHasher.createNodeWorker = createNodeWorker

export class BrowserPayloadHasher extends PayloadHasher {
  static override createBrowserWorker = createBrowserWorker
  static override createNodeWorker = createNodeWorker
}
