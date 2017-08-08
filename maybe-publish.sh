#!/bin/bash

greenEcho () {
  echo -e "\033[30;48;5;82m $1 \033[0m"
}

newVersion=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
newVersionLength=$(printf "%s" "$newVersion" | wc -m)
newVersionFirstChar=$(printf "%s" "$newVersion" | cut -c1-1)

if [[ $newVersionLength -gt 0 && $newVersionFirstChar != "0" ]]; then
  if [[ $newVersion == "1.0.0" ]]; then
    currentVersion="no_current_version"
  else
    currentVersion=$(npm show whitelodge version)
  fi
  if [[ $CI == true && $TRAVIS == true && $TRAVIS_BRANCH == "master" && $TRAVIS_PULL_REQUEST == false && $newVersion != $currentVersion ]]
  then
    greenEcho "Publishing to NPM"
    npm adduser
    npm publish
  fi
fi
