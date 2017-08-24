#!/bin/bash

runCommandWithTeardown () {
  eval $1; commandResult=$?
  if [[ $commandResult -ne 0 ]]; then
    eval $2
    exit 3
  fi
}

greenEcho () {
  echo -e "\033[30;48;5;82m $1 \033[0m"
}

installingEcho="greenEcho \"Installing packages required for tests\""
runningTestsEcho="greenEcho \"Running tests\""
uninstallingEcho="greenEcho \"Uninstalling packages required for tests\""

# Run tests using lowest versions of peer dependencies
teardownCommand="$uninstallingEcho && npm uninstall react"
eval $installingEcho
runCommandWithTeardown "npm install react@0.13.0 --no-save" "$teardownCommand"
eval $runningTestsEcho
runCommandWithTeardown "jest --verbose" "$teardownCommand"
eval $teardownCommand

# Run tests using latest versions of peer dependencies
teardownCommand="$uninstallingEcho && npm uninstall react react-dom react-test-renderer"
eval $installingEcho
runCommandWithTeardown "npm install react@latest react-dom@latest react-test-renderer@latest --no-save" "$teardownCommand"
eval $runningTestsEcho
runCommandWithTeardown "jest --verbose" "$teardownCommand"
eval $teardownCommand

greenEcho "✔ All tests passed!"
