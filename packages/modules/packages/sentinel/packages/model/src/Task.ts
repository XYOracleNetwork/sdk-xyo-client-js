import { NameOrAddress } from '@xyo-network/module-model'

export interface SentinelTask {
  /** @field determines what inputs are sent to each module - if string, that is the output from other module (name/address) */
  input?: boolean | string
  /** @field the modules that performs the task */
  module: NameOrAddress
}
