import { Distribution } from './distribution'

export const calculateAllPropertiesDistribution = <T>(array: T[]): Distribution<T> => {
  const distribution: Distribution<T> = {}

  array.forEach((item) => {
    for (const property in item) {
      if (Object.prototype.hasOwnProperty.call(item, property)) {
        const value = item[property as keyof T]
        if (value !== undefined && value !== null) {
          const valueString = value.toString()
          if (!distribution[property]) {
            distribution[property] = { [valueString]: 1 }
          } else if (!distribution[property]![valueString]) {
            ;(distribution[property] as Record<string, number>)[valueString] = 1
          } else {
            ;(distribution[property] as Record<string, number>)[valueString] += 1
          }
        }
      }
    }
  })

  return distribution
}
