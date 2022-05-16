export const exists = <T>(x: T | undefined | null): x is T => {
  return !!x
}
