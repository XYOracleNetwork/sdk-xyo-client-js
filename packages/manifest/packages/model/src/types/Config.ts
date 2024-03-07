import { Manifest } from './Manifest'

export type ConfigManifest<S extends string = string> = Manifest & {
  accountPath?: string
  name: string
  schema: S
}
