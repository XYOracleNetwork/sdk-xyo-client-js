import { Worker } from 'threads'

export const createNodeWorker = (func?: () => unknown) => {
  try {
    const code = func?.toString().slice(6) ?? ''
    const w = new Worker(
      code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { fromSource: true } as any,
    )
    return w
  } catch {
    return
  }
}
