const forward = (migration) => {
  const redirect = migration.createContentType('redirect')
  redirect.name('Redirect')
  redirect.displayField('fromPath')

  redirect.createField('fromPath')
    .name('From Path')
    .type('Symbol')
    .required(true)
    .validations([
      {
        'unique': true
      },
      {
        'regexp': {
          'pattern': '^\/',
          'flags': null
        },
        'message': 'Path must start with forward slash (/)'
      }
    ])

  const fromPathSettings = { 'helpText': 'May include asterisk (*) as a wildcard.' }
  redirect.changeFieldControl('fromPath', 'builtin', 'singleLine', fromPathSettings)

  redirect.createField('toLink')
    .name('To (Link)')
    .type('Link')
    .linkType('Entry')
    .validations([
      {
        'linkContentType': [
          'dynamicPage',
          'externalLink',
          'internalLink',
          'page'
        ]
      }
    ])

  const toLinkSettings = { 'helpText': 'Use this field if there is an appropriate Internal Link, Page, or External Link that the redirect should target.' }
  redirect.changeFieldControl('toLink', 'builtin', 'entryLinkEditor', toLinkSettings)

  redirect.createField('toPath')
    .name('To (Path)')
    .type('Symbol')
    .validations([
      {
        'regexp': {
          'pattern': '^\/|http',
          'flags': null
        },
        'message': 'Path must start with forward slash (/) for internal page or "http" for external site.'
      }
    ])

  const toPathSettings = { 'helpText': 'Use this to redirect to a page which does not have a Contentful Page, Internal Link, etc. For instance, "/" would redirect to the home page of the site. Can also link out to an external site with a full url.' }
  redirect.changeFieldControl('toPath', 'builtin', 'singleLine', toPathSettings)

  redirect.createField('forwardPath')
    .name('Forward Path')
    .type('Boolean')

  const forwardPathSettings = { 'helpText': 'For paths with a wildcard, should pass on the subpath from the requested url when redirecting?' }
  redirect.changeFieldControl('forwardPath', 'builtin', 'boolean', forwardPathSettings)

  redirect.createField('forwardQuery')
    .name('Forward Query')
    .type('Boolean')

  const forwardQuerySettings = { 'helpText': 'Should pass on query string when redirecting?' }
  redirect.changeFieldControl('forwardQuery', 'builtin', 'boolean', forwardQuerySettings)
}

const reverse = (migration) => {
  migration.deleteContentType('redirect')
}

module.exports = forward
