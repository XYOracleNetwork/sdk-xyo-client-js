import { assertEx } from '@xyo-network/sdk-xyo-js'

const obj2Neo4jEntries = (obj: Record<string, unknown>, prefix?: string): [key: string, value: unknown][] => {
  assertEx(obj !== undefined, 'Object is undefined')
  const params = Object.entries(obj)
  const valueArrays = params.map(([key, value]): [key: string, value: unknown][] => {
    switch (typeof value) {
      case 'boolean':
      case 'number':
      case 'string':
        return [[`${prefix ? prefix : ''}${key}`, value]]
      case 'object': {
        return value ? obj2Neo4jEntries(value as Record<string, unknown>, `${prefix ? prefix : ''}${key}_`) : []
      }
      default:
        throw Error(`Unsupported type [${typeof value}]`)
    }
  })
  const result: [key: string, value: unknown][] = []
  valueArrays.forEach((entries) => {
    entries.forEach((entry) => {
      result.push(entry)
    })
  })
  return result
}

const neo4jEntries2String = (entries: [key: string, value: unknown][]): string => {
  const entryStrings = entries.map(([key, value]): string => {
    switch (typeof value) {
      case 'boolean':
      case 'number':
        return `${key}: ${value}`
      case 'string':
        return `${key}: '${value}'`
      default:
        throw Error(`Unsupported type [${typeof value}]`)
    }
  })
  return `{${entryStrings.join(', ')}}`
}

export { neo4jEntries2String, obj2Neo4jEntries }
