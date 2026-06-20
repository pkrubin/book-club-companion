#!/usr/bin/env bash

set -euo pipefail

strict=false
if [[ "${1:-}" == "--strict" ]]; then
    strict=true
fi

git rev-parse --verify origin/main >/dev/null
git rev-parse --verify origin/test >/dev/null

read_version() {
    git show "$1:package.json" | sed -n 's/.*"version": "\([^"]*\)".*/\1/p' | head -1
}

main_version="$(read_version origin/main)"
test_version="$(read_version origin/test)"
main_date="$(git log -1 --format=%cs origin/main)"
test_date="$(git log -1 --format=%cs origin/test)"
test_only="$(git rev-list --count origin/main..origin/test)"
main_only="$(git rev-list --count origin/test..origin/main)"

main_in_test=false
test_in_main=false
if git merge-base --is-ancestor origin/main origin/test; then
    main_in_test=true
fi
if git merge-base --is-ancestor origin/test origin/main; then
    test_in_main=true
fi

status="ALIGNED"
problem=false

if [[ "$main_version" != "$test_version" ]]; then
    status="PENDING_PROMOTION"
    problem=true
fi

if [[ "$main_in_test" == false && "$test_in_main" == false ]]; then
    status="DIVERGED"
    problem=true
fi

cat <<EOF
Release alignment: $status
  prod/main: v$main_version ($main_date)
  test:      v$test_version ($test_date)
  commits only on test: $test_only
  commits only on main: $main_only
  main is ancestor of test: $main_in_test
  test is ancestor of main: $test_in_main
EOF

if [[ "$main_version" != "$test_version" ]]; then
    echo "Action: finish validation and make a promote-or-defer decision before unrelated feature work."
fi

if [[ "$main_in_test" == false && "$test_in_main" == false ]]; then
    echo "Action: reconcile branch ancestry during the next controlled production promotion."
fi

if [[ "$strict" == true && "$problem" == true ]]; then
    exit 2
fi
