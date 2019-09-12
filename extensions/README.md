# Contentful Extensions CLI
Use the Contentful CLI to create and update extensions. The UI currently does not provide a method to define extension parameters, so using the CLI is necessary in such cases.

`contentful extension [create|update|delete] --space-id 'spaceId' --environment-id 'envName' --management-token 'token' --descriptor extensionDefinitionFile.json --force`

If you do not provide an environment name then 'master' will be used by default!
