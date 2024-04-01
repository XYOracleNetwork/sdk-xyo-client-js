interface XyoGlobalThis {
  xyo: {
    unique: Record<string, unknown>
  }
}

export const globallyUnique = (name: string, value: unknown, domain = 'global') => {
  const uniqueName = [domain, name].join(':')
  console.log(`globallyUnique: ${uniqueName}`)
  const xyo = ((globalThis as unknown as XyoGlobalThis).xyo = (globalThis as unknown as XyoGlobalThis).xyo ?? {})
  const unique = (xyo.unique = xyo.unique ?? {})
  if (unique[uniqueName] === undefined) {
    unique[uniqueName] = value
  } else {
    if (unique[uniqueName] !== value) {
      throw new Error(
        `Global unique item ${uniqueName} already defined.  Make sure you are not importing two versions of the package that contains this item`,
      )
    }
  }
  return uniqueName
}
