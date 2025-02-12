// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
contract DemoCounter {
    uint256 public number;

    constructor(uint256 initNumber) {
        number = initNumber;
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
