#!/bin/bash

set -eu

export digest=$(cat ./edge-image/digest)
export mobileLayoutImageDigest=$(cat ./mobile-layout-edge-image/digest)

pushd charts-repo

ref=$(yq e '.image.git_ref' charts/web-wallet/values.yaml)
git checkout ${BRANCH}
old_ref=$(yq e '.image.git_ref' charts/web-wallet/values.yaml)

cat <<EOF >> ../body.md
# Bump web-wallet image

The web-wallet image will be bumped to digest:
\`\`\`
${digest}
\`\`\`

The web-wallet-mobile-layout image will be bumped to digest:
\`\`\`
${mobileLayoutImageDigest}
\`\`\`

Code diff contained in this image:

https://github.com/GaloyMoney/web-wallet/compare/${old_ref}...${ref}
EOF

gh pr close ${BOT_BRANCH} || true
gh pr create \
  --title bump-web-wallet-image-${ref} \
  --body-file ../body.md \
  --base ${BRANCH} \
  --head ${BOT_BRANCH} \
  --label galoybot \
  --label web-wallet
