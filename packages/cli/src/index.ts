import { printLogo, start } from './lib'
import { startTerminal } from './terminal'

const main = async () => {
  await printLogo()
  const node = await start()
  await startTerminal(node)
}

main()
  .then(() => {
    console.log('Finishing,...')
  })
  .catch(() => {
    console.log('Excepting,...')
  })
