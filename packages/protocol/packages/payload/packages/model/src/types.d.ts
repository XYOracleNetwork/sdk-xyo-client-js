/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export interface Array<T> {
  filter<T extends S>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[]
  find<T extends S>(predicate: (value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined
}
