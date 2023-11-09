export const tryCall = async <T>(func: () => Promise<T>, name?: string): Promise<T | undefined> => {
  try {
    return await func()
  } catch (ex) {
    if (name) {
      const error = ex as Error
      console.log(`tryCall failed [${name}]: ${error.message}`)
    }
    return undefined
  }
}
