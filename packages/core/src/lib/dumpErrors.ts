const dumpErrors = (errors: Error[]) => {
  errors.forEach((error) => {
    console.log(error, null, 2)
  })
}

export { dumpErrors }
