// allow floor map to be toggled on service points
const forward = (migration) => {
  // STEP 1 - Create Internal Link content type
  const internalLink = migration.createContentType('internalLink')
  internalLink.name('Internal Link')
  internalLink.displayField('title')

  internalLink.createField('title')
    .name('Title')
    .type('Symbol')
    .required(true)

  // This will be marked as required later in migration
  internalLink.createField('page')
    .name('Page')
    .type('Link')
    .linkType('Entry')
    .validations([
      { 'linkContentType': ['page'] }
    ])

  const pageFieldSettings = {
    "helpText": "Page that the link should direct users to."
  }
  internalLink.changeEditorInterface('page', 'entryLinkEditor', pageFieldSettings)

  internalLink.createField('usePageTitle')
    .name('Use Page Title for Link Text')
    .type('Boolean')

  const usePageTitleSettings = {
    "helpText": "If Yes, link text should be the same as the title of the page this link references. Otherwise, will use the Title of this entry for the link text."
  }
  internalLink.changeEditorInterface('usePageTitle', 'boolean', usePageTitleSettings)

  internalLink.createField('context')
    .name('Context')
    .type('Symbol')
    .validations([
      { 'in': ['Subject', 'Unspecified'] }
    ])

  const contextFieldSettings = {
    "helpText": "The area where the link should be displayed. Use Unspecified or leave empty if other content will be referencing this link."
  }
  internalLink.changeEditorInterface('context', 'radio', contextFieldSettings)

  // STEP 2 - Set up a reference field on Page. This is required for step 3, and will be removed later in migration.
  const page = migration.editContentType('page')

  page.createField('tmpLinkToPage')
    .name('TMP_LinkToInternalLink')
    .type('Link')
    .linkType('Entry')
    .validations([
      { 'linkContentType': ['internalLink'] }
    ])

  // STEP 3 - Make an Internal Link for all the Pages that are marked as Subjects
  migration.deriveLinkedEntries({
    contentType: 'page',
    derivedContentType: 'internalLink',
    from: ['title', 'type', 'slug'],
    toReferenceField: 'tmpLinkToPage',
    derivedFields: ['title', 'page', 'usePageTitle', 'context'],
    identityKey: async (fromFields) => {
      return fromFields.slug ? fromFields.slug['en-US'] : fromFields.title['en-US']
    },
    shouldPublish: true,
    deriveEntryForLocale: async (inputFields, currentLocale) => {
      // Only make entries for pages that have type "Subject" and a slug
      if (!inputFields.type || inputFields.type['en-US'] !== 'Subject' || !inputFields.slug || !inputFields.slug['en-US']) {
        return
      }
      return {
        title: `${inputFields.title[currentLocale]}`,
        usePageTitle: true,
        context: 'Subject',
      }
    }
  })

  // STEP 4 - Remove the temporary link on page that we never even cared about but contentful migration requires
  page.deleteField('tmpLinkToPage')

  // STEP 5 - Mark page as a required field for InternalLink going forward
  internalLink.editField('page').required(true)

  // STEP 6 - Modify Pages of type "Subject" -> "Page"
  migration.transformEntries({
    contentType: 'page',
    from: ['type'],
    to: ['type'],
    transformEntryForLocale: function (fromFields, currentLocale) {
      if (fromFields.type[currentLocale] !== 'Subject') {
        return
      }
      return { type: 'Page' }
    }
  })

  // STEP 7 - Remove subject type from Page
  page.editField('type')
    .validations([
      { 'in': ['Page', 'Service', 'Branch'] }
    ])
}

const reverse = (migration) => {
  migration.deleteContentType('internalLink')
}

module.exports = forward
