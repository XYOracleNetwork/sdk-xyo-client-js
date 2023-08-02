export type Distribution<T> = {
  [K in keyof T]?: { [value: string]: number }
}
