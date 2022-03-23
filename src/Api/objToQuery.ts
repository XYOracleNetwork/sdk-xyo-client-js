export const objToQuery = (obj: Record<string, string | number>) => {
  return `?${Object.entries(obj)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .join('&')}`
}
