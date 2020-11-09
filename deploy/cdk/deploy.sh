#!/bin/bash
mkdir -p "../../apps/build"

for path in ../../apps/*/; do
  dirname="$(basename "${path}")"
  if [ "$dirname" == "build" ]
  then
    continue
  fi

  pushd "$path"

  yarn build

  # move the build to a shared folder which we can upload easily
  # delete it first because mv works differently if the directory already exists
  rm -R "../build/$dirname"
  mv ./build "../build/$dirname"

  popd
done

# Now that everything has been built, we're ready to deploy!
# Make sure to run this script with aws authentication.
cdk deploy
