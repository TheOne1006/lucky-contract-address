// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract LuckyFactory {
    address payable public immutable owner;
    string public constant WEBSITE = "lca.theone.io";
    event Deploy(address indexed deployedAddress, uint256 salt);

    constructor() {
        // payable() 将这个普通地址转换为 address payable 类型
        owner = payable(msg.sender);
    }

    function deploy(uint256 _salt, bytes memory bytecode) public payable {
        require(bytecode.length > 0, "bytecode is empty");

        bytes32 salt = bytes32(_salt);
        address addr;

        assembly {
            addr := create2(
                0,              // value (ETH amount)
                add(bytecode, 0x20),  // bytecode start at 0x20
                mload(bytecode),      // bytecode bytecode len
                salt            // salt
            )

            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        require(addr != address(0), "Create2: Failed on deploy");
        emit Deploy(addr, _salt);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        owner.transfer(address(this).balance);
    }

    function calculateAddr(uint256 _salt, bytes memory bytecode) public view returns(address addr) {
        addr = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            bytes32(_salt),
            keccak256(bytecode)
        )))));
    }
}
