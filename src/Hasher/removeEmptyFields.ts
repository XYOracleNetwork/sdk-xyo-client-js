export const removeEmptyFields = (obj: Record<string, unknown>) => {
  if (Array.isArray(obj)) return obj
  const newObject: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      newObject[key] = removeEmptyFields(value as Record<string, unknown>)
    } else if (value !== undefined) {
      newObject[key] = value
    }
  })
  return newObject
}
