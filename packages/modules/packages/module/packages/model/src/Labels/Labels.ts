/**
 * Object used to represent labels identifying a resource.
 */
export interface Labels {
  [key: string]: string | undefined
}

/**
 * Interface for objects that have labels.
 */
export interface WithLabels<T extends Labels = Labels> {
  labels: T
}

/**
 * Interface for objects that have labels.
 */
export interface WithOptionalLabels<T extends Labels = Labels> {
  labels?: T
}

/**
 * Returns true if the source object has all the labels from the required set
 * @param source Source object to check against
 * @param required Set of labels to check for in source
 * @returns True of the source object has all the labels from the required set
 */
export const hasAllLabels = (source: Labels, required: Labels): boolean => {
  return Object.entries(required).every(([key, value]) => {
    // eslint-disable-next-line no-prototype-builtins
    return source.hasOwnProperty(key as keyof typeof source) && source?.[key as keyof typeof source] === value
  })
}
