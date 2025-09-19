// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { MemeToken } from "./MemeToken.sol";
import { LiquidityLocker } from "./LiquidityLocker.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MemeLaunchpad {
    struct TokenInfo {
        address token;
        address creator;
        string name;
        string symbol;
        uint256 supply;
        uint256 timestamp;
    }

    TokenInfo[] public allTokens;
    mapping(address => address[]) public tokensByCreator;

    event TokenCreated(address indexed creator, address indexed token, string name, string symbol, uint256 supply);
    event LiquidityLocked(
        address indexed locker,
        address indexed lpToken,
        address indexed beneficiary,
        uint256 unlockTime,
        uint256 amount
    );

    function createMemeToken(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        uint256 feeBasisPoints,
        address feeCollector
    ) external returns (address token) {
        MemeToken t = new MemeToken(name_, symbol_, initialSupply, msg.sender, feeBasisPoints, feeCollector);
        token = address(t);

        allTokens.push(
            TokenInfo({
                token: token,
                creator: msg.sender,
                name: name_,
                symbol: symbol_,
                supply: initialSupply,
                timestamp: block.timestamp
            })
        );

        tokensByCreator[msg.sender].push(token);

        emit TokenCreated(msg.sender, token, name_, symbol_, initialSupply);
        return token;
    }

    function lockLiquidity(
        address lpToken,
        uint256 amount,
        uint256 unlockTime,
        address beneficiary
    ) external returns (address locker) {
        require(amount > 0, "Zero amount");
        require(unlockTime > block.timestamp, "Unlock time must be future");
        require(beneficiary != address(0), "Zero beneficiary");

        LiquidityLocker l = new LiquidityLocker(lpToken, beneficiary, unlockTime);
        locker = address(l);

        require(IERC20(lpToken).transferFrom(msg.sender, locker, amount), "Transfer failed");

        emit LiquidityLocked(locker, lpToken, beneficiary, unlockTime, amount);
        return locker;
    }

    // view helpers
    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    function getAllTokens() external view returns (TokenInfo[] memory) {
        return allTokens;
    }

    function tokensOf(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }
}
