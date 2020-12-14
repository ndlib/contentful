const forward = (migration) => {
  const alert = migration.editContentType('alert')

  alert.createField('domains')
    .name('Domains')
    .type('Array')
    .required(true)
    .items({
      type: 'Symbol',
      validations: [
        {
          in: [
            'library',
            'primo',
            'primoNDU',
            'primoHCC',
            'illiad',
          ],
        },
      ],
    })
  alert.moveField('domains').afterField('type')
  alert.changeFieldControl('domains', 'builtin', 'checkbox', {})

  migration.transformEntries({
    contentType: 'alert',
    from: ['domain', 'title'],
    to: ['domains'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.domain || !fromFields.domain[currentLocale]) {
        console.log('NO DOMAIN:', fromFields.title[currentLocale])
        return
      }

      const value = fromFields.domain[currentLocale]
      return {
        domains: value === 'all' ? [
          'library',
          'primo',
          'primoNDU',
          'primoHCC',
          'illiad',
        ] : [ value ]
      }
    }
  })

  alert.deleteField('domain')
}

const reverse = (migration) => {
  const alert = migration.editContentType('alert')

  alert.createField('domain')
    .name('Domain')
    .type('Symbol')
    .required(true)
    .validations([
      {
        in: [
          'all',
          'library',
          'primo',
          'primoNDU',
          'primoHCC',
          'illiad',
        ],
      },
    ])
  alert.moveField('domain').afterField('type')

  migration.transformEntries({
    contentType: 'alert',
    from: ['domains'],
    to: ['domain'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      const values = fromFields.domains[currentLocale]
      return {
        domain: values.length > 1 ? 'all' : values[0]
      }
    }
  })

  alert.deleteField('domains')
}

module.exports = forward
