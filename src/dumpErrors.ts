const dumpErrors = (errors: Error[]) => {
  errors.forEach((error) => {
    console.log(error)
  })
}

export { dumpErrors }
