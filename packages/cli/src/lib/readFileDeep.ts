import { readFileSync } from 'fs'
import { resolve } from 'path'
import { terminal } from 'terminal-kit'

export const readFileDeep = (names: string[]) => {
  let depth = 0
  let result: string | undefined
  let filename
  let resolvedPath
  while (depth < 10 && result === undefined) {
    names.forEach((name) => {
      if (result === undefined) {
        filename = name
        for (let i = 0; i < depth; i++) {
          filename = `../${filename}`
        }
        resolvedPath = resolve(filename)
        try {
          result = readFileSync(resolvedPath, { encoding: 'utf8' })
        } catch (ex) {
          const error = ex as NodeJS.ErrnoException
          if (error.code !== 'ENOENT') {
            terminal.red(`${JSON.stringify(error)}\n`)
          }
        }
      }
    })
    depth++
  }
  return [result, resolvedPath]
}
