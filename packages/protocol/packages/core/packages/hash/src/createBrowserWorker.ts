import { Worker } from 'threads'

export const createBrowserWorker = (path: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Worker(new URL(path, import.meta.url) as any)
  } catch {
    return
  }
}
