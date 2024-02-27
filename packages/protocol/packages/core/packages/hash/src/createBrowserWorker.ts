import { Worker } from '@xylabs/threads'

export const createBrowserWorker = (url?: URL) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Worker(url as any)
  } catch {
    return
  }
}
