import { ValidateFunction } from 'ajv'

export type GetValidator<T> = (x: T) => Promise<ValidateFunction | undefined>
