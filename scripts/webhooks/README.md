# Create Contentful Webhooks
## Introduction
Generates webhooks for alpha/beta/libguides in the library-website(prod) contentful space

## Setup
None

## Executing the process
IN A TERMINAL WINDOW:
 1. clone this project and cd /scripts/webhooks/
 2. python updateWebhooks.py -r REVISION --oauth TOKEN --space ID

Optionally you can pass these self-explanatory flags --debug, --verbose, --dryrun

## Helpful links
1. [about webhooks](https://www.contentful.com/developers/docs/concepts/webhooks/)
 
