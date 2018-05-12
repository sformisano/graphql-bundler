# GraphQL Bundler - Automatically Bundle Your Schema Files

[![Build Status](https://travis-ci.org/sformisano/graphql-bundler.svg?branch=master)](https://travis-ci.org/sformisano/graphql-bundler)
[![Coverage Status](https://coveralls.io/repos/github/sformisano/graphql-bundler/badge.svg)](https://coveralls.io/github/sformisano/graphql-bundler)
[![Maintainability](https://api.codeclimate.com/v1/badges/4c1c54fac9bb30aad8fa/maintainability)](https://codeclimate.com/github/sformisano/graphql-bundler/maintainability)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

### The Problem

If you're working with GraphQL, there's a good chance you've either heard of or are using [graphql-tools](https://github.com/apollographql/graphql-tools).

One of the many cool things graphql-tools does for you is allow you to describe your schema as a GraphQL type language string and your resolvers as an object literal with all the resolver methods (check [the example section](https://github.com/apollographql/graphql-tools#example) of their readme to see how this works).

There's a problem though: what happens when you start having hundreds of type definitions and resolvers? As you can imagine, managing a single type definitions string and a single object literal for a growing project means you're soon going to deal with files that are thousands of lines long. Not ideal.

### The Solution

GraphQL Bundler allows you to split your type definitions and resolver functions in as many files and directories as you'd like: the bundling functions will merge it all back for you.

Here's a very simple feature centric example structure:

```
- your-api/
          |__ src/
                 |__ user/
                 |       |__ user.graphql
                 |       |
                 |       |__ signup/
                 |       |         |__ signup.graphql
                 |       |         |__ signup.js
                 |       |
                 |       |__ login/
                 |                |__ login.graphql
                 |                |__ login.graphql
```

In the above example, the `user.graphql` file may contain your generic user type definition/s, whereas your signup.graphql file may contain a few specific input types related to the signup feature.

The javascript files, on the other hand, would export an object literal that would look like this:

```
module.exports = {
  Query: {
    exampleQuery: () => {}
  },
  Mutation: {
    exampleMutation: () => {}
  },
  Subscription: {
    exampleSubscription: () => {}
  }
}
```

In the case of our example, `signup.js` could look something like this:

```
module.exports = {
  Mutation: {
    signup: () => {}
  }
}
```

This is only an example structure. You can organise your type definitions and resolvers files in any way you see fit.

## Installation

Installing GraphQL Bundler is super easy:

`npm install --save graphql-bundler`

and including it in your project is just as easy:

```js
const { getBundledGraphQLTypeDefs, getBundledGraphQLResolvers } = require('graphql-bundler')

// do your thing
```

## Let's Bundle It All Together

1. Install GraphQL Bundler: `npm install --save graphql-bundler`.
2. Create your graphql type definition and resolver files.
3. Make sure your `.graphql files` contain nothing but valid GraphQL type definitions.
4. Make sure your `.js resolver files` export an object literal containing only `Query`, `Mutation` and `Subscription` as top level properties, each with valid methods within them.
5. Once you have all your type definition files and resolver files in place, you are ready to generate the bundle.

Here's a quick example:

```js
// make sure to include graphql-tools in your project!
const { makeExecutableSchema } = require('graphql-tools')
const { getBundledGraphQLTypeDefs, getBundledGraphQLResolvers } = require('graphql-bundler')

const executableSchema = makeExecutableSchema({
  typeDefs: getBundledGraphQLTypeDefs('./path/to/your/graphql/files/**/*.graphql'),
  resolvers: getBundledGraphQLResolvers('./path/to/your/resolver/files/**/*.js')
})
```

Essentially, the two bundler functions exported by GraphQL Bundler do the following:
 1. They take a [glob](https://en.wikipedia.org/wiki/Glob_(programming)) as argument.
 2. They retrieve all the files matching the glob passed as argument.
 3. They validate the contents of those files to make sure they are valid type definitions and resolvers.
 4. They bundled them together while doing additional things like checking for duplicates.
 5. They return the bundled type definitions and resolvers.

## Why I Built GraphQL Bundler

I wanted to have a better folder structure for the GraphQL projects I work on :)
