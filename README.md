## Contentful
All things dealing with contentful spaces.

Uses [Contentful CLI](https://github.com/contentful/contentful-cli) for content creation and data transformations.

See [contentfulMigrations/README.md](https://github.com/ndlib/contentful/blob/master/contentfulMigrations/README.md) for more information.

To run a migration, first install packages with `yarn install`, then run:
```
yarn migrate <environmentId> <fileName> [spaceName] [accessToken]
```

Will default to using `library-website` for the space if not provided.

You can place your access token at the root in a file named `access_token` so you don't have to look it up every time. It should be in the .gitignore, but **make sure not to commit this file.** If this file does not exist, you will be prompted to enter a token.
