// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AvaStaking
 * @dev A staking contract for AVAX tokens with reward distribution
 */
contract AvaStaking is ReentrancyGuard, Ownable, Pausable {
    // Structure to store staker information
    struct Stake {
        uint256 amount;        // Amount of tokens staked
        uint256 since;        // Timestamp of stake
        uint256 claimedRewards; // Rewards claimed so far
    }

    // Token being staked (AVAX)
    IERC20 public stakingToken;
    
    // Annual Percentage Rate (APR) in basis points (1% = 100)
    uint256 public apr = 500; // 5% APR
    
    // Minimum staking amount
    uint256 public minimumStake = 1 ether; // 1 AVAX
    
    // Mapping of staker address to their stake info
    mapping(address => Stake) public stakes;
    
    // Total staked amount
    uint256 public totalStaked;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event APRUpdated(uint256 newApr);

    /**
     * @dev Constructor
     * @param _stakingToken Address of the AVAX token contract
     */
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @dev Stake tokens
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= minimumStake, "Below minimum stake amount");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (stakes[msg.sender].amount > 0) {
            // If already staking, claim pending rewards first
            claimRewards();
        }

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].since = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Calculate pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount
     */
    function calculateRewards(address user) public view returns (uint256) {
        Stake storage userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - userStake.since;
        uint256 rewardRate = (apr * userStake.amount) / 10000; // APR in basis points
        uint256 rewards = (rewardRate * stakingDuration) / 365 days;
        
        return rewards - userStake.claimedRewards;
    }

    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() public nonReentrant whenNotPaused {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");

        stakes[msg.sender].claimedRewards += rewards;
        require(stakingToken.transfer(msg.sender, rewards), "Reward transfer failed");

        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Withdraw staked tokens
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");

        // Claim any pending rewards first
        if (calculateRewards(msg.sender) > 0) {
            claimRewards();
        }

        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;

        if (stakes[msg.sender].amount == 0) {
            // Reset staking timestamp if fully withdrawn
            stakes[msg.sender].since = 0;
        }

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Update APR (only owner)
     * @param _apr New APR in basis points
     */
    function setAPR(uint256 _apr) external onlyOwner {
        require(_apr <= 10000, "APR cannot exceed 100%");
        apr = _apr;
        emit APRUpdated(_apr);
    }

    /**
     * @dev Emergency pause staking contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause staking contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get user stake information
     * @param user Address of the user
     * @return amount Staked amount
     * @return since Stake timestamp
     * @return rewards Pending rewards
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 since,
        uint256 rewards
    ) {
        Stake storage userStake = stakes[user];
        return (
            userStake.amount,
            userStake.since,
            calculateRewards(user)
        );
    }
}