# Lucky Contract Address

A tool to help you deploy smart contracts with specific address patterns across multiple blockchain networks.

## Features

- **Multi-Chain Support**: Deploy contracts on different blockchain networks
- **Lucky Address Generation**: Generate contract addresses that match specific patterns
  - Support hex format matching (e.g., 88888888...)
  - Support regular expression matching
- **Smart Contract Compilation**: Built-in Solidity compiler with multi-version support
- **Constructor Parameter Configuration**: Support dynamic configuration of contract constructor parameters
- **Parallel Computing**: Multi-process parallel computation for improved address matching efficiency

## Probability Calculation

Contract addresses have `2^160` possible combinations, represented as 40 hexadecimal characters.
For a pattern of 8 consecutive identical characters (e.g., 8), the probability is:

**Approximate Estimation**:

- The probability of 8 consecutive identical characters starting at each position is $\frac{1}{16^7}$, with 33 possible positions.
- Approximate probability is $\frac{33}{16^7} \approx 1.229 \times 10^{-7}$ (Poisson approximation).

### 1. **Probability Analysis**

- Probability of 8 consecutive identical characters:

$$
p = \frac{33}{16^7} \approx 1.229 \times 10^{-7}
$$

---

### 2. **Expected Number of Attempts**

- With probability $p$, the expected number of attempts needed for one success is:

$$
E = \frac{1}{p} = \frac{16^7}{33} \approx 8.138 \times 10^6
$$

---

### 3. **Computation Time**

- Computation speed is 100,000 ops (10,000 attempts per second).
- Required time (seconds):
  $$
  \text{Time} = \frac{E}{\text{ops}} = \frac{8.138 \times 10^6}{100,000} = 81.38 \text{s}
  $$
- Converting to more intuitive units:
  - Minutes: $\frac{81.38}{60} \approx 1.356 \text{min}$

---

## Breaking the Bottleneck

Pure JavaScript version is relatively slow. Using alternatives like WebAssembly (WASM):

| Version                                   | Ops per Worker |
| ----------------------------------------- | -------------- |
| JS Version (ethereum-cryptography/keccak) | 30,000         |
| WebAssembly Version                       | 50,000         |

todo: Export to other languages

## How It Works

This tool uses the CREATE2 opcode to deterministically generate contract addresses. The address is calculated using the following formula:

```solidity
addr = address(uint160(uint(keccak256(abi.encodePacked(
        bytes1(0xff),
        address(this),
        bytes32(salt),
        keccak256(bytecode)
    )))));
```

Where:

- factoryAddress: The address of the deployment factory contract
- salt: A random number used to generate different addresses
- bytecode: The contract bytecode

## Usage

1. **Write/Compile Contract**

   - Input Solidity code for compilation
   - Or directly input contract bytecode

2. **Configure Lucky Number**

   - Set desired address pattern (hex format or regular expression)
   - Configure constructor parameters (if needed)
   - Select number of worker processes
     > Note: More worker processes mean faster search but higher system resource usage

3. **Start Search**

   - Click "Check" button to start searching for matching addresses
   - System will compute in parallel until finding a matching address

4. **Deploy Contract**
   - Select the found lucky address
   - Confirm gas fee
   - Execute deployment transaction

### Recommended Regular Expressions

Regex testing site: [regex101](https://regex101.com/)

> tips: addresses are converted to lowercase

1. `/([\da-f])\1{13}/`: 13 consecutive identical digits
2. `/^0x[0-9a-f]*(?:.*8){13}[0-9a-f]*$/`: Contains at least 13 occurrences of 8 (can be non-consecutive)
   - Probability: $P(X \geq 13) = \sum_{k=13}^{40} \binom{40}{k} \left(\frac{1}{16}\right)^k \left(\frac{15}{16}\right)^{40-k}.$
   - $\approx 1.23 \times 10^{-10}$
   - 1 match per minute at 120,000 ops/s
   - example: `0xbde8c0cc98d6008988e8880863813385576858ea`
3. `/^0x(?:[0-35-9a-f]*8){10}[0-35-9a-f]*$/`: At least 10 occurrences of 8 without 4

## Tech Stack

- Frontend Framework: Next.js + React
- Blockchain Interaction: wagmi + viem
- Multi-language Support: i18n
- Parallel Computing: Web Workers + WebAssembly
- Smart Contract: Solidity

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build production version
pnpm build
```

## Contributing

Issues and Pull Requests are welcome to help improve this project.
