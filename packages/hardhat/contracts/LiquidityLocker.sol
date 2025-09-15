// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LiquidityLocker
 * @notice Holds ERC20 (LP) tokens until an unlock time. Only the beneficiary can withdraw after unlock.
 */

contract LiquidityLocker is Ownable {
    IERC20 public immutable LP_TOKEN;
    address public immutable BENEFICIARY;
    uint256 public immutable UNLOCK_TIME;

    event Locked(address indexed lpToken, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed beneficiary, uint256 amount);

    constructor(
        address _lpToken,
        address _beneficiary,
        uint256 _unlockTime
    )
        Ownable(_beneficiary) // or Ownable(msg.sender), depending on who should be owner
    {
        require(_lpToken != address(0), "Zero lp token");
        require(_beneficiary != address(0), "Zero beneficiary");
        require(_unlockTime > block.timestamp, "Unlock must be future");

        LP_TOKEN = IERC20(_lpToken);
        BENEFICIARY = _beneficiary;
        UNLOCK_TIME = _unlockTime;
    }

    function withdraw() external {
        require(block.timestamp >= UNLOCK_TIME, "Locked");
        uint256 balance = LP_TOKEN.balanceOf(address(this));
        require(balance > 0, "Nothing to withdraw");
        require(LP_TOKEN.transfer(BENEFICIARY, balance), "Transfer failed");
        emit Withdrawn(BENEFICIARY, balance);
    }
}
