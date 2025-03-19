import { Worker } from '@xylabs/threads'

export const createNodeWorker = (func?: () => unknown): Worker => {
  try {
    const code = func?.toString().slice(6) ?? ''
    return new Worker(
      code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { fromSource: true } as any,
    )
  } catch {
    throw new Error('Unable to create worker')
  }
}
