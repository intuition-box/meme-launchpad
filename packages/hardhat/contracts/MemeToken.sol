// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemeToken
 * @notice ERC20 token with fee-on-transfer (basis points) and exclusion list
 */
contract MemeToken is ERC20, ERC20Burnable, Ownable {
    uint256 public feeBasisPoints; // e.g. 100 = 1%
    address public feeCollector;
    string public imageURI; // IPFS URI for token image
    mapping(address => bool) public isExcludedFromFee;

    event FeeUpdated(uint256 feeBasisPoints);
    event FeeCollectorUpdated(address feeCollector);
    event ExclusionSet(address account, bool excluded);
    event ImageURIUpdated(string imageURI);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply, // in whole tokens (18 decimals assumed)
        address initialOwner,
        uint256 initialFeeBasisPoints,
        address initialFeeCollector,
        string memory initialImageURI
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply * (10 ** decimals()));
        feeBasisPoints = initialFeeBasisPoints;
        feeCollector = initialFeeCollector == address(0) ? initialOwner : initialFeeCollector;
        imageURI = initialImageURI;
        isExcludedFromFee[initialOwner] = true;
        isExcludedFromFee[address(this)] = true;
    }

    function setFeeBasisPoints(uint256 _feeBasisPoints) external onlyOwner {
        require(_feeBasisPoints <= 2000, "Fee too high"); // max 20%
        feeBasisPoints = _feeBasisPoints;
        emit FeeUpdated(_feeBasisPoints);
    }

    function setFeeCollector(address _collector) external onlyOwner {
        require(_collector != address(0), "Zero address");
        feeCollector = _collector;
        emit FeeCollectorUpdated(_collector);
    }

    function setExcludedFromFee(address account, bool excluded) external onlyOwner {
        isExcludedFromFee[account] = excluded;
        emit ExclusionSet(account, excluded);
    }

    function setImageURI(string memory _imageURI) external onlyOwner {
        imageURI = _imageURI;
        emit ImageURIUpdated(_imageURI);
    }

    /// @dev Override ERC20’s hook to apply fee logic
    function _update(address from, address to, uint256 amount) internal override {
        // If either side is excluded, no fee
        if (isExcludedFromFee[from] || isExcludedFromFee[to] || feeBasisPoints == 0) {
            super._update(from, to, amount);
        } else {
            uint256 fee = (amount * feeBasisPoints) / 10_000;
            uint256 remaining = amount - fee;

            // Take fee
            if (fee > 0) {
                super._update(from, feeCollector, fee);
            }

            // Send remainder
            super._update(from, to, remaining);
        }
    }
}
