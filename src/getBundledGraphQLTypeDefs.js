const fs = require('fs')
const _ = require('lodash')
const getFilesMatchingGlob = require('get-files-matching-glob')
const _baseGraphQLTypes = require('../data/_baseGraphQLTypes')

/**
 * Cache for schemas.
 * @type {Object}
 */
let cachedSchemas = {}

/**
 * Takes a glob pattern matching graphql files, bundles them together, and returns them as a single string.
 * Returns cached data when multiple requests with the same glob patterns are triggered.
 *
 * @param {string} globPattern
 * @returns {string}
 */
module.exports = (globPattern) => {
  if (cachedSchemas.hasOwnProperty(globPattern)) {
    return cachedSchemas[globPattern]
  }

  const graphqlFiles = getFilesMatchingGlob(globPattern)
  const typeDefsBaseTypes = _.map(_baseGraphQLTypes, (gqlType) => {
    return `type ${gqlType}`
  })

  let schema = ''

  graphqlFiles.forEach(file => {
    schema += "\n\n" + fs.readFileSync(file, 'utf8')
  })

  // collapse multiple spaces into one, multiple line breaks into two (leaves empty line between each type declaration)
  schema = schema.replace(/  +/g, ' ').replace(/\n\s*\n/g, '\n\n')

  typeDefsBaseTypes.forEach(baseType => {
    const subject = new RegExp(baseType, 'gi')
    const replacement = 'extend ' + baseType
    schema = schema.replace(subject, 'extend ' + baseType).replace(replacement, baseType)
  })

  cachedSchemas[globPattern] = schema

  return schema
}
