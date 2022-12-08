import { start } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  await startTerminal(await start())
}

main()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
  })
