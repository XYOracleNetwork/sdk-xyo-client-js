import { JsonArray, JsonObject, JsonValue } from '@xylabs/object'

const toJsonArray = (value: unknown[], cycleList?: unknown[], maxDepth = 3): JsonArray => {
  return value.map((item) => toJsonValue(item, cycleList, maxDepth))
}

const toJsonObject = (value: object, cycleList?: unknown[], maxDepth = 3): JsonObject => {
  const result: JsonObject = {}
  for (const [key, entry] of Object.entries(value)) {
    result[key] = value === undefined ? '[Undefined]' : toJsonValue(entry, cycleList, maxDepth)
  }
  return result
}

const toJsonValue = (value: unknown, cycleList?: unknown[], maxDepth = 3): JsonValue => {
  console.log(`toJsonValue: ${maxDepth}`)
  if (maxDepth <= 0 && typeof value === 'object') {
    return '[MaxDepth]'
  }
  if (cycleList?.includes(value)) {
    return '[Circular]'
  }
  switch (typeof value) {
    case 'string':
    case 'boolean':
    case 'number': {
      return value
    }
    case 'object': {
      if (value === null) {
        return null
      }
      const newCycleList = cycleList ?? []
      newCycleList.push(value)
      return Array.isArray(value) ? toJsonArray(value, newCycleList, maxDepth - 1) : toJsonObject(value, newCycleList, maxDepth - 1)
    }
    default: {
      return `[${typeof value}]`
    }
  }
}

export const toJson = (value: unknown, maxDepth = 3): JsonValue => {
  return toJsonValue(value, undefined, maxDepth)
}
