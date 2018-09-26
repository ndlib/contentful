const forward = (migration) => {
    const news = migration.editContentType('news')
  
    news.createField('prevPublishedUrl')
      .name('Previously Published')
      .type('Symbol')

    news.createField('articleContacts')
      .name('Article Contacts')
      .type('Text')
  }
  
  const reverse = (migration) => {
    const news = migration.editContentType('news')
    news.deleteField('prevPublishedUrl')
    news.deleteField('articleContacts')
  }
  
  module.exports = forward
  