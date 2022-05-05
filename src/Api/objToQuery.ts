export const objToQuery = (obj: Record<string, string | number | undefined>) => {
  return `?${Object.entries(obj)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .filter((value) => value !== undefined)
    .join('&')}`
}
