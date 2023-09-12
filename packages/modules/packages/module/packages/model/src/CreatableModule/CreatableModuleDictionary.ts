import { CreatableModuleFactory } from './CreatableModuleFactory'

export interface CreatableModuleDictionary {
  [key: string]: CreatableModuleFactory
}

interface TagsDictionary {
  [key: string]: string | undefined
}

export interface WithTags<T extends TagsDictionary> {
  tags: T
}

export type TaggedCreatableModuleFactory = CreatableModuleFactory & TagsDictionary

export interface CreatableModuleRegistry {
  [key: string]: (CreatableModuleFactory | TaggedCreatableModuleFactory)[] | undefined
}

export const hasTags = (factory: CreatableModuleFactory | TaggedCreatableModuleFactory): factory is TaggedCreatableModuleFactory => {
  return (factory as TaggedCreatableModuleFactory).tags !== undefined
}

export const hasAllTags = (subset: object, superset: object): boolean => {
  return Object.entries(subset).every(([key, value]) => {
    // eslint-disable-next-line no-prototype-builtins
    return superset.hasOwnProperty(key as keyof typeof superset) && superset?.[key as keyof typeof superset] === value
  })
}

export class CreatableModuleFactoryLocator {
  constructor(protected readonly registry: CreatableModuleRegistry = {}) {}

  locate(schema: string, tags?: TagsDictionary): CreatableModuleFactory | TaggedCreatableModuleFactory | undefined {
    const moduleFactories = this.registry[schema]
    if (tags) {
      return moduleFactories?.filter(hasTags).find((f) => hasAllTags(tags, f))
    } else {
      return moduleFactories?.[0]
    }
  }

  registerAdditional(additional: CreatableModuleRegistry) {
    Object.entries(additional).map(([schema, factories]) => {
      if (factories) {
        const existingFactories = this.registry[schema]
        this.registry[schema] = existingFactories ? (this.registry[schema] = [...existingFactories, ...factories]) : factories
      }
    })
  }

  tryLocate(schema: string, tags?: TagsDictionary): CreatableModuleFactory | TaggedCreatableModuleFactory | undefined {
    try {
      return this.locate(schema, tags)
    } catch {
      return undefined
    }
  }
}
