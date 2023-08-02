import { Distribution } from './distribution'

export const calculatePropertyDistribution = <T>(array: T[], property: keyof T): Distribution<T> => {
  const distribution: Distribution<T> = {}
  array.forEach((item) => {
    const value = item[property]
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
  })
  return distribution
}
