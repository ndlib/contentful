// This migration is mostly duplicated from the one before (convertExternalToInternalLink). It is essentially Phase 2.
// We have to wait until the first migration is done before we can run this because the Internal Links need to exist
// in contentful before we can fetch them and update existing references. Here, we will be updating the references
// in Link Groups to External Links which we have now made Internal Links for. The External Links can then be
// disposed of, since they should be fully converted over.
const forward = async (migration, { makeRequest }) => {

  // Fetch preliminary data that we need to link up records
  const externalLinks = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=externalLink&limit=1000`
  })
  const pages = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=page&limit=1000`
  })
  const internalLinks = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=internalLink&limit=1000`
  })

  // Find external links that have a matching internal link. This is similar to what we did in Phase 1, only now
  // our end goal is associating with an Internal Link instead of a Page.
  const linksToMigrate = []
  externalLinks.items.forEach(ext => {
    // Ignore external links that don't have a url or really are pointing to external sites
    // The ones that should be internal links will all start with /
    if (!ext.fields.url || !ext.fields.url['en-US'] || !ext.fields.url['en-US'].startsWith('/')) {
      return
    }
    const matchingInternalLink = internalLinks.items.find(int => {
      // Don't use the subject internal links. They aren't named right, even if they do point to the right page.
      if (int.fields.context['en-US'] === 'Subject') {
        return false
      }
      if (int.fields.title['en-US'] === ext.fields.title['en-US']) {
        return true
      }
      const linkedPage = pages.items.find(page => page.sys.id === int.fields.page['en-US'].sys.id)
      return linkedPage && ('/' + linkedPage.fields.slug['en-US']) === ext.fields.url['en-US']
    })

    if (matchingInternalLink) {
      // We should transform this external link into an internal link, linking to the same page
      linksToMigrate.push({ externalLink: ext, internalLink: matchingInternalLink })
    }
  })

  // Update external links within link groups
  migration.transformEntries({
    contentType: 'linkGroup',
    from: ['links'],
    to: ['links'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      let hasChanged = false
      const outputLinks = []
      fromFields.links[currentLocale].forEach(link => {
        const migrationData = linksToMigrate.find(x => x.externalLink.sys.id === link.sys.id)
        if (migrationData) {
          outputLinks.push({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: migrationData.internalLink.sys.id,
            },
          })
          hasChanged = true
        } else {
          outputLinks.push(link)
        }
      })
      if (!hasChanged) {
        return // Don't modify records that don't have any external links which need remediation.
      }

      return {
        links: outputLinks,
      }
    }
  })
}

const reverse = (migration) => {
  // Reversing this would probably impact more than just the ones that were transformed, and it's kind of complicated.
  // We shouldn't have to reverse any of this anyway. The impact is not very big and we could just remediate by hand.
}

module.exports = forward
