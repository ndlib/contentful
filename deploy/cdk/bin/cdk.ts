#!/usr/bin/env node
import 'source-map-support/register'
import { execSync } from 'child_process'
import * as cdk from '@aws-cdk/core'
import { StackTags } from '@ndlib/ndlib-cdk'
import { ContentfulAppsStack } from '../lib/contentful-apps-stack'

// The context values here are defaults only. Passing context in cli will override these
const username = execSync('id -un').toString().trim()
const app = new cdk.App({
  context: {
    owner: username,
    contact: `${username}@nd.edu`,
  },
})
cdk.Aspects.of(app).add(new StackTags())

new ContentfulAppsStack(app, 'ContentfulApps', {
  stackName: app.node.tryGetContext('stackName') || 'contentful-apps',
})
