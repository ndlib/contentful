const { runMigration } = require('contentful-migration')
const path = require('path')
const fs = require('fs')
const readlineSync = require("readline-sync")

const argv = process.argv.slice(2)

if (argv.length < 2) {
  console.log('Usage: migrate <environmentId> <filePath> [spaceId] [accessToken]')
  process.exit()
}

const environmentId = argv[0]

const filePath = path.resolve(__dirname, `../contentfulMigrations/${argv[1]}`)

const spaceId = (() => {
  const spaceName = argv[2] || 'library-website'
  switch (spaceName.toLowerCase()) {
    case 'library-website':
    case 'library website':
    case 'usurper':
      return 'cfblb1f7i85j'
    case 'archivies':
    case 'archives':
    case 'archives-rr':
      return '6vuuqxb2pkxd'
    case 'purl':
      return '6ohe2xfve1xs'
    case 'testing sandbox':
    case 'sandbox':
      return '0381bcijkisx'
  }
})()

let accessToken = argv[3] || process.env.CONTENTFUL_MANAGEMENT_TOKEN
if (!accessToken) {
  // It's gitignored so you can keep your personal token here instead of specifying it every time
  const tokenPath = path.resolve(__dirname, '../access_token')
  if (fs.existsSync(tokenPath)) {
    accessToken = fs.readFileSync(tokenPath, 'utf8')
  }

  // If we still don't have a token, prompt the user.
  if (!accessToken) {
    accessToken = readlineSync.question('Enter access token: ')
  }
}

const options = {
  environmentId,
  filePath,
  spaceId,
  accessToken,
}
runMigration(options)
  .then(() => console.log('Migration Done!'))
  .catch((e) => console.error(e))
