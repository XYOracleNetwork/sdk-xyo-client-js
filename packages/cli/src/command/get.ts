export const command = 'get <source> [proxy]'

export const describe = 'make a get HTTP request'

export const builder = {
  banana: {
    default: 'cool',
  },
  batman: {
    default: 'sad',
  },
}

export const handler = function (_argv: unknown) {
  // do something with argv.
}

// eslint-disable-next-line import/no-default-export
export default {
  builder,
  command,
  describe,
  handler,
}
