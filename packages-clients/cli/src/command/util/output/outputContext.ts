import { BaseArguments } from '../../BaseArguments'
import { outputJsonError, outputJsonLog, outputRawError, outputRawLog } from './formatters'

export const outputContext = async (
  args: BaseArguments,
  commandContext: (outputLog: (value: unknown) => void, outputError: (value: unknown) => void) => void | Promise<void>,
) => {
  const { output, verbose } = args
  let log
  let err
  switch (output) {
    case 'raw':
      log = outputRawLog
      err = outputRawError
      break
    default:
      err = outputJsonError
      log = outputJsonLog
      break
  }
  try {
    await commandContext(log, err)
  } catch (error) {
    if (verbose) err(error)
    throw error
  }
}
