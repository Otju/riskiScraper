'use strict'
const { main } = require('./index')

module.exports.run = async (event, context) => {
  const time = new Date()
  console.log(`FUNCTION "${context.functionName}" ran at ${time}`)
  try {
    await main()
  } catch (e) {
    console.log('ERROR', e.message)
  }
}
