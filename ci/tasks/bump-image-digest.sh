#!/bin/bash

set -eu

export digest=$(cat ./dealer-image/digest)
export fake_galoyapi_digest=$(cat ./fake-galoyapi-image/digest)
export ref=$(cat ./repo/.git/short_ref)

pushd charts-repo

yq -i e '.dealer.image.digest = strenv(digest)' ./charts/dealer/values.yaml
yq -i e '.fakeGaloyApi.image.digest = strenv(fake_galoyapi_digest)' ./charts/dealer/values.yaml
yq -i e '.dealer.image.git_ref = strenv(ref)' ./charts/dealer/values.yaml
yq -i e '.fakeGaloyApi.image.git_ref = strenv(ref)' ./charts/dealer/values.yaml

if [[ -z $(git config --global user.email) ]]; then
  git config --global user.email "bot@galoy.io"
fi
if [[ -z $(git config --global user.name) ]]; then
  git config --global user.name "CI Bot"
fi

(
  cd $(git rev-parse --show-toplevel)
  git merge --no-edit ${BRANCH}
  git add -A
  git status
  git commit -m "Bump dealer image to '${digest}'"
)
