/* eslint-disable */
const config = {
  _id: 'dbrs',
  version: 1,
  members: [
      {
          _id: 0,
          host: '127.0.0.1:27017',
          priority: 1
      },
  ]
}
rs.initiate(config, { force: true })
rs.status()
