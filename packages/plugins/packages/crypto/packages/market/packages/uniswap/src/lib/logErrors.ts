export const logErrors = <T>(func: () => T) => {
  try {
    return func()
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export const logErrorsAsync = async <T>(func: () => Promise<T>) => {
  try {
    return await func()
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}
