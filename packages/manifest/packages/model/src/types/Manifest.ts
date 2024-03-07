export type WithJsonSchema<T extends object> = T & { $schema: string }

export interface Manifest {
  description?: string
}
