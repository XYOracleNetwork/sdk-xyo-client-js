export const profile = async <T>(func: () => Promise<T>): Promise<[T, number]> => {
  const start = Date.now()
  const result = await func()
  const duration = Date.now() - start
  return [result, duration]
}
