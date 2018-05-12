const _ = require('lodash')
const _baseGraphQLTypes = require('../data/_baseGraphQLTypes')

// makes testing easier, no need to test a one line method triggering a require
const _getFileContent = (file) => {
  return require(file)
}

/**
 * Validates the contents of the resolvers file and returns the exported resolvers object.
 *
 * @param {String} resolversFile
 * @returns {Object}
 * @private
 */
module.exports = (resolversFile) => {
  const resolvers = _getFileContent(resolversFile)

  if (!_.isPlainObject(resolvers)) {
    throw new Error(`The resolvers file must export an object literal.`)
  }

  const invalidProperties = Object.keys(resolvers).filter((property) => {
    return _baseGraphQLTypes.indexOf(property) === -1
  })

  if (invalidProperties.length) {
    throw new Error(`The following properties are not valid graphql base types: ${invalidProperties.join(', ')}`)
  }

  return resolvers
}