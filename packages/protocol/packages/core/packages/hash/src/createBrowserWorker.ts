import { Worker } from '@xylabs/threads'

export const createBrowserWorker = (url?: URL): Worker => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Worker(url as any)
  } catch {
    throw new Error('Unable to create worker')
  }
}
