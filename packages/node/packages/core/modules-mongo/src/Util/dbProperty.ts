export const escapeChar = '#'

export const toDbProperty = (value: string) => value.replaceAll('.', escapeChar)

export const fromDbProperty = (value: string) => value.replaceAll(escapeChar, '.')
