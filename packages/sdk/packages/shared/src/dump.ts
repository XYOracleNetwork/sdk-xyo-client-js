export const dump = (obj: unknown) => {
  const cache: unknown[] = []
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Duplicate reference found, discard key
        if (cache.includes(value)) {
          return '[circular]'
        }

        // Store value in our collection
        cache.push(value)
      }
      return value
    },
    2,
  )
}
