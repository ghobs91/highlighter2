LOCKFILE := "pnpm-lock.yaml"

build:
    turbo build

renew:
    if [ -f {{LOCKFILE}} ]; then \
        rm {{LOCKFILE}}; \
    fi \
    && find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \; \
    && pnpm install

renew-all:
    if [ -f {{LOCKFILE}} ]; then \
        rm {{LOCKFILE}}; \
    fi \
    && find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \; \
    && pnpm store prune \
    && pnpm install

compile-ndk:
    ./ndk_compile.sh

branches:
    @echo "Current branch: `git branch --show-current`" \
        && if [[ -n $(git status --porcelain) ]]; then \
            git status --porcelain; \
        fi
    @echo "@packages branch: `cd packages && git branch --show-current`" \
        && cd packages && if [[ -n $(git status --porcelain) ]]; then \
            git status --porcelain; \
        fi
    @echo "packages/ndk branch: `cd packages/ndk && git branch --show-current`" \
        && cd packages/ndk && if [[ -n $(git status --porcelain) ]]; then \
            git status --porcelain; \
        fi

update:
    git submodule update --recursive --remote
    cd packages && git checkout master && git pull
