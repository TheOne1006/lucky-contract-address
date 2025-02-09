# install pkg

```bash
brew install wasm-pack

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## check

```bash
wasm-pack --version
rustc --version
cargo --version
```

## configure environment

```bash
# For sh/bash/zsh/ash/dash/pdksh
. "$HOME/.cargo/env"

# For fish
source $HOME/.cargo/env

```

## build

```bash
wasm-pack build --target web

cp pkg/keccak_wasm_bg.wasm ../public/workers
```

`keccak-wasm/pkg/keccak_wasm_bg.wasm`
http://localhost:3000/workers/keccak_wasm_bg.wasm
