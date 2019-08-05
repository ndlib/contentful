const forward = async (migration, { makeRequest }) => {
  const alertModel = migration.editContentType('alert')

  // NOTE: This name is temporary. Once we are done, we will rewrite it back to a field called simply "description".
  // This is because you cannot change the type of an existing field, so we need a new field to store the value first.
  alertModel.createField('richDescription')
    .name('Rich Description')
    .type('Text')
    .required(true)
  alertModel.moveField('richDescription').afterField('description')

  migration.transformEntries({
    contentType: 'alert',
    from: ['description', 'url', 'type', 'domain'],
    to: ['richDescription', 'type', 'domain'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.description || !fromFields.description[currentLocale]) {
        return
      }
      const text = fromFields.description[currentLocale]
      const url = fromFields.url ? fromFields.url[currentLocale] : null

      // If there is already a url on the alert, apply the link to the full text to maintain existing functionality.
      const newValue = (url ? `[${text}](${url})` : text)
      return {
        richDescription: newValue,
        // The rest is to fix validation errors from legacy records. Old records may not have a value for these, but
        // a value is now required in order to publish.
        type: (fromFields.type && fromFields.type[currentLocale]) ? fromFields.type[currentLocale] : 'Informational',
        domain: (fromFields.domain && fromFields.domain[currentLocale]) ? fromFields.domain[currentLocale] : 'library',
      }
    }
  })

  // Delete the existing description field and recreate it as a long text, which supports markdown
  alertModel.deleteField('description')
  alertModel.createField('description')
    .name('Description')
    .type('Text')
    .required(true)
  alertModel.moveField('description').afterField('domain')

  // Also delete url field because we don't need it anymore
  alertModel.deleteField('url')

  // Transfer the value over from the placeholder field "rich description" to the "description" field
  migration.transformEntries({
    contentType: 'alert',
    from: ['richDescription'],
    to: ['description'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.richDescription || !fromFields.richDescription[currentLocale]) {
        return
      }

      return {
        description: fromFields.richDescription[currentLocale],
      }
    }
  })

  // Now remove "rich description" as it is redundant
  alertModel.deleteField('richDescription')
}

const reverse = (migration) => {
  const alertModel = migration.editContentType('alert')

  alertModel.createField('richDescription')
    .name('Rich Description')
    .type('Text')
    .required(true)
  alertModel.moveField('richDescription').afterField('description')

  // Transfer the value over from the "description" field to the "rich description" field
  migration.transformEntries({
    contentType: 'alert',
    from: ['description'],
    to: ['richDescription'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.description || !fromFields.description[currentLocale]) {
        return
      }

      return {
        richDescription: fromFields.description[currentLocale],
      }
    }
  })

  // Restore the url field
  alertModel.createField('url')
    .name('More Information URL')
    .type('Symbol')
  alertModel.moveField('url').afterField('endTime')
  alertModel.changeEditorInterface('url', 'urlEditor', {})

  // Delete and recreate the description field as a Symbol (short text)
  alertModel.deleteField('description')
  alertModel.createField('description')
    .name('Description')
    .type('Symbol')
  alertModel.moveField('description').afterField('domain')

  // Populate the url and description fields using rich description
  migration.transformEntries({
    contentType: 'alert',
    from: ['richDescription'],
    to: ['description', 'url'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.richDescription || !fromFields.richDescription[currentLocale]) {
        return
      }

      const markdown = fromFields.richDescription[currentLocale]
      // Set some defaults
      let url = ''
      let desc = markdown

      // If there is a url, we need to do some parsing
      if (markdown.includes('[')) {
        desc = markdown.substring(markdown.indexOf('[') + 1, markdown.indexOf(']'))
        url = markdown.substring(markdown.indexOf('(') + 1, markdown.indexOf(')'))
      }

      return {
        description: desc,
        url: url,
      }
    }
  })

  alertModel.deleteField('richDescription')
}

module.exports = forward
