# MongoDB Scripts

The following scripts exist to initialize the local MongoDB instance
appropriately. From [their docs](https://hub.docker.com/_/mongo):

> When a container is started for the first time it will execute files with
> extensions `.sh` and `.js` that are found in `/docker-entrypoint-initdb.d`.
> Files will be executed in alphabetical order. `.js` files will be executed by
> mongo using the database specified by the `MONGO_INITDB_DATABASE` variable,
> if it is present, or test otherwise. You may also switch databases within the
> `.js` script.

It doesn't look like they support:

-   `await`
-   `console`

so be sure to code your scripts accordingly.

## Debugging

For debugging with `mongosh` you can connect with something similar to the
following:

```shell
mongosh --authenticationDatabase admin mongodb://root:example@localhost:27017/archivist
```

From the mongo shell, to seed the DB with test data you can run:

```shell
load('./scripts/mongo/test/seed.js')
```
