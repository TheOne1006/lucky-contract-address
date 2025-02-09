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
        // 测试数据
        let factory_address = hex::decode("1234567890123456789012345678901234567890").unwrap();
        let salt = hex::decode("0000000000000000000000000000000000000000000000000000000000000001").unwrap();
        let bytecode_hash = hex::decode("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470").unwrap();

        let result = compute_create2_address(&factory_address, &salt, &bytecode_hash);
        assert_eq!(result.len(), 32); // 确保返回的是32字节的完整哈希

        // 验证最后20字节是否符合预期的以太坊地址格式
        let address = &result[12..];
        assert_eq!(address.len(), 20);

        // 验证生成的地址是否符合预期
        let expected_address = hex::decode("4d1a2e2bb4f88f0250f26ffff098b0b30b26bf38").unwrap();
        assert_eq!(address, expected_address);
    }
}
