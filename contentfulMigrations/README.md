# Contentful Migration

## What is it?
Used to migrate/transform Contentful models and data

## Pre-requisites && Installation
requires node.js 8.x
[Contentful CLI](https://github.com/contentful/contentful-cli)

## Usage
[Official README](https://github.com/contentful/contentful-cli/tree/master/docs/space/migration)

contentful space migration --space-id 'spaceId' --environment-id 'envName' --access-token 'token' migrationFileName.js

If you do not provide an environment name then 'master' will be used by default!

This used to use [Contentful Migration](https://github.com/contentful/contentful-migration), but the CLI portion of that project has since moved to Contentful CLI. The documentation on the Contentful Migration page might be more useful, though.