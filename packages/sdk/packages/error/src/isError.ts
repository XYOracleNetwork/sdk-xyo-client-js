// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isError = (error: any): error is Error => {
  return typeof error.message === 'string' && typeof error.name === 'string'
}
