const sortObject = <T extends Record<string, unknown>>(obj: T) => {
  if (obj === null) {
    return null
  }
  const result: Record<string, unknown> = {} as Record<string, unknown>
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (Array.isArray(obj[key])) {
        result[key] = obj[key]
      } else if (typeof obj[key] === 'object') {
        result[key] = sortObject(obj[key] as Record<string, unknown>)
      } else {
        result[key] = obj[key]
      }
    })
  return result as T
}

export default sortObject
