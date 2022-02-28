#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

unpack_deps


pushd repo

make dealer-check-code
