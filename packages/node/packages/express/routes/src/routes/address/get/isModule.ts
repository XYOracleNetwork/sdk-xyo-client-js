import { Module } from '@xyo-network/module'

export const isModule = (x: Module | Partial<Module>): x is Module => {
  try {
    return x && x?.address && x?.queries ? true : false
  } catch (_error) {
    return false
  }
}
