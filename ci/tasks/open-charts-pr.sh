#!/bin/bash

set -eu

export digest=$(cat ./dealer-image/digest)

pushd charts-repo

ref=$(yq e '.dealer.image.git_ref' charts/dealer/values.yaml)
git checkout ${BRANCH}
old_ref=$(yq e '.dealer.image.git_ref' charts/dealer/values.yaml)

cat <<EOF >> ../body.md
# Bump dealer image
The dealer image will be bumped to digest:
```
${digest}
```
Code diff contained in this image:
https://github.com/GaloyMoney/dealer/compare/${old_ref}...${ref}
EOF

gh pr close ${BOT_BRANCH} || true
gh pr create \
  --title bump-dealer-image-${ref} \
  --body-file ../body.md \
  --base ${BRANCH} \
  --head ${BOT_BRANCH} \
  --label galoybot \
  --label dealer
