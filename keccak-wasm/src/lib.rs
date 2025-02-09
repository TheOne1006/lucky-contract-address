use wasm_bindgen::prelude::*;
use tiny_keccak::{Hasher, Keccak};

#[wasm_bindgen]
pub fn keccak256(input: &[u8]) -> Vec<u8> {
    let mut hasher = Keccak::v256();
    let mut output = [0u8; 32];
    hasher.update(input);
    hasher.finalize(&mut output);
    output.to_vec()
}

#[wasm_bindgen]
pub fn compute_create2_address(factory_address: &[u8], salt: &[u8], bytecode_hash: &[u8]) -> Vec<u8> {
    let mut input = Vec::with_capacity(1 + factory_address.len() + salt.len() + bytecode_hash.len());
    input.push(0xff);
    input.extend_from_slice(factory_address);
    input.extend_from_slice(salt);
    input.extend_from_slice(bytecode_hash);

    let mut hasher = Keccak::v256();
    let mut output = [0u8; 32];
    hasher.update(&input);
    hasher.finalize(&mut output);

    output.to_vec() // 返回完整的32字节哈希结果
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_keccak256() {
        let input = b"Hello, World!";
        let result = keccak256(input);
        assert_eq!(result.len(), 32);
        // 预期的哈希值可以通过其他工具（如 web3.utils.keccak256）验证
        let expected = hex::decode("acaf3289d7b601cbd114fb36c4d29c85bbfd5e133f14cb355c3fd8d99367964f").unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn test_compute_create2_address() {
        let factory_address = hex::decode("Dc64a140Aa3E981100a9becA4E685f962f0cF6C9").unwrap();
        // 将 BigInt(12) 转换为 32 字节的十六进制字符串
        let salt = hex::decode("000000000000000000000000000000000000000000000000000000000000000c").unwrap();
        let bytecode_hash = hex::decode("799813918fa0bdf07c97809b9d0d698d2c93356913a2c736747e65cb17f52045").unwrap();

        let result = compute_create2_address(&factory_address, &salt, &bytecode_hash);

        assert_eq!(result.len(), 32); // 确保返回的是32字节的完整哈希

        // 打印 result
        println!("Complete hash result: 0x{}", hex::encode(&result));
        println!("Contract address: 0x{}", hex::encode(&result[12..]));

        // assert_eq!(result.len(), 32); // 确保返回的是32字节的完整哈希

        // 验证最后20字节是否符合预期的以太坊地址格式
        let address = &result[12..];
        assert_eq!(address.len(), 20);

        // 验证生成的地址是否符合预期
        let expected_address = hex::decode("9B147D70D6bF720AC292E8ad862ad65E60769013").unwrap();
        assert_eq!(address, expected_address);
    }
}
