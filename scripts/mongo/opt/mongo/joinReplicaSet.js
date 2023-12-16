/* eslint-disable no-undef */
const config = {
  _id: 'dbrs',
  members: [
    {
      _id: 0,
      host: '127.0.0.1:27017',
      priority: 1,
    },
  ],
  version: 1,
}
rs.initiate(config, { force: true })
rs.status()
