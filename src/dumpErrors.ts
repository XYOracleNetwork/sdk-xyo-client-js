const dumpErrors = (errors: Error[]) => {
  errors.forEach((error) => {
    console.log(`Error: ${error}`)
  })
}

export { dumpErrors }
