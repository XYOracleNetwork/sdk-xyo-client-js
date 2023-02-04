import { CommandModule } from 'yargs'

const command: CommandModule = {
  builder: {
    banana: {
      default: 'cool',
    },
    batman: {
      default: 'sad',
    },
  },
  command: 'get <source> [proxy]',
  describe: 'make a get HTTP request',
  handler: function (_argv: unknown) {
    // do something with argv.
  },
}

// eslint-disable-next-line import/no-default-export
export default command
