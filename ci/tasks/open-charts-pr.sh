#!/bin/bash

set -eu

export digest=$(cat ./edge-image/digest)

pushd charts-repo

ref=$(yq e '.image.git_ref' charts/galoy-pay/values.yaml)
git checkout ${BRANCH}
old_ref=$(yq e '.image.git_ref' charts/galoy-pay/values.yaml)

cat <<EOF >> ../body.md
# Bump galoy-pay image

The galoy-pay image will be bumped to digest:
```
${digest}
```

Code diff contained in this image:

https://github.com/GaloyMoney/galoy-pay/compare/${old_ref}...${ref}
EOF

gh pr close ${BOT_BRANCH} || true
gh pr create \
  --title bump-galoy-pay-image-${ref} \
  --body-file ../body.md \
  --base ${BRANCH} \
  --head ${BOT_BRANCH} \
  --label galoybot
