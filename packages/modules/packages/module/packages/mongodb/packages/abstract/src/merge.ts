/* eslint-disable @typescript-eslint/no-explicit-any */
function isObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object'
}

export function merge<T extends object>(target: T, ...sources: any[]): T {
  if (!isObject(target)) {
    throw new TypeError('Target must be an object')
  }

  for (const source of sources) {
    if (!isObject(source)) {
      continue
    }

    for (const key of Object.keys(source)) {
      const sourceVal = source[key]
      const targetVal = (target as any)[key]

      if (Array.isArray(sourceVal)) {
        // Arrays are replaced, not deeply merged (lodash behavior)
        (target as any)[key] = [...sourceVal]
      } else if (isObject(sourceVal)) {
        if (!isObject(targetVal)) {
          (target as any)[key] = {}
        }
        merge((target as any)[key], sourceVal)
      } else {
        (target as any)[key] = sourceVal
      }
    }
  }

  return target
}
