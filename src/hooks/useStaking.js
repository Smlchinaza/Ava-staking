import { useState, useEffect, useCallback } from 'react';
import { getContract, formatEther, parseEther, getProvider, switchToAvalancheNetwork, calculateAPR } from '../utils/web3';
import { CONTRACT_ADDRESS } from '../utils/constants';

export const useStaking = () => {
    const [stakingContract, setStakingContract] = useState(null);
    const [stakeInfo, setStakeInfo] = useState({
        stakedAmount: "0",
        stakingSince: "0",
        rewards: "0"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [networkError, setNetworkError] = useState(null);
    const [apr, setApr] = useState("0");
    const [minimumStakeAmount, setMinimumStakeAmount] = useState("0");
    const [totalStakedAmount, setTotalStakedAmount] = useState("0");
    const [transactionHistory, setTransactionHistory] = useState([]);

    // Initialize contract
    useEffect(() => {
        const initContract = async () => {
            try {
                const provider = getProvider();
                if (provider) {
                    // Check if on Avalanche network
                    const network = await provider.getNetwork();
                    const isAvalanche = network.chainId === 43114 || network.chainId === 43113; // Mainnet or Fuji testnet
                    
                    if (!isAvalanche) {
                        setNetworkError("Please connect to the Avalanche network");
                        // Attempt to switch to Avalanche network
                        try {
                            await switchToAvalancheNetwork();
                            // Wait for the network to actually change
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            // Get the new network after switching
                            const newNetwork = await provider.getNetwork();
                            if (newNetwork.chainId !== 43113) {
                                throw new Error("Failed to switch to Avalanche network");
                            }
                            setNetworkError(null);
                        } catch (switchError) {
                            console.error("Failed to switch network:", switchError);
                            setNetworkError("Please manually switch to the Avalanche Fuji Testnet");
                            return;
                        }
                    }
                    
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    const contract = getContract(CONTRACT_ADDRESS, signer);
                    
                    // Verify contract connection
                    try {
                        await contract.stakingToken();
                        setStakingContract(contract);
                        setNetworkError(null);
                        // Set up event listeners
                        setupEventListeners(contract);
                    } catch (contractError) {
                        console.error("Contract connection error:", contractError);
                        setNetworkError("Contract not found on this network. Please check you're on Avalanche Fuji Testnet");
                    }
                }
            } catch (error) {
                console.error("Error initializing contract:", error);
                setNetworkError("Error connecting to the contract. Please check your network.");
            }
        };
        initContract();
        
        // Cleanup event listeners on unmount
        return () => {
            if (stakingContract) {
                stakingContract.removeAllListeners();
            }
        };
    }, []);

    // Set up event listeners for contract events
    const setupEventListeners = (contract) => {
        if (!contract) return;
        
        contract.on("Staked", (user, amount, event) => {
            if (isUserEvent(user)) {
                addToTransactionHistory({
                    type: "Stake",
                    amount: formatEther(amount),
                    timestamp: new Date().toISOString(),
                    transactionHash: event.transactionHash
                });
                refreshStakeInfo();
                fetchTotalStaked();
            }
        });
        
        contract.on("Withdrawn", (user, amount, event) => {
            if (isUserEvent(user)) {
                addToTransactionHistory({
                    type: "Withdraw",
                    amount: formatEther(amount),
                    timestamp: new Date().toISOString(),
                    transactionHash: event.transactionHash
                });
                refreshStakeInfo();
                fetchTotalStaked();
            }
        });
        
        contract.on("RewardsClaimed", (user, amount, event) => {
            if (isUserEvent(user)) {
                addToTransactionHistory({
                    type: "Claim Rewards",
                    amount: formatEther(amount),
                    timestamp: new Date().toISOString(),
                    transactionHash: event.transactionHash
                });
                refreshStakeInfo();
            }
        });
    };
    
    // Check if event is for the current user
    const isUserEvent = async (eventUser) => {
        if (!stakingContract) return false;
        try {
            const currentUser = await stakingContract.signer.getAddress();
            return eventUser.toLowerCase() === currentUser.toLowerCase();
        } catch (error) {
            return false;
        }
    };
    
    // Add transaction to history
    const addToTransactionHistory = (transaction) => {
        setTransactionHistory(prev => [transaction, ...prev].slice(0, 10)); // Keep last 10 transactions
    };

    // Get stake info
    const refreshStakeInfo = useCallback(async () => {
        if (!stakingContract) return;
        try {
            const address = await stakingContract.signer.getAddress();
            const info = await stakingContract.getStakeInfo(address);
            setStakeInfo({
                stakedAmount: formatEther(info.amount),
                stakingSince: info.since.toNumber() > 0 
                    ? new Date(info.since.toNumber() * 1000).toLocaleString() 
                    : "Not staked yet",
                rewards: formatEther(info.rewards)
            });
        } catch (error) {
            console.error("Error fetching stake info:", error);
        }
    }, [stakingContract]);
    
    // Fetch APR from contract
    const fetchAPR = useCallback(async () => {
        if (!stakingContract) return;
        try {
            const aprValue = await stakingContract.apr();
            // APR is stored as basis points (1/100 of a percent)
            setApr((aprValue.toNumber() / 100).toFixed(2));
        } catch (error) {
            console.error("Error fetching APR:", error);
        }
    }, [stakingContract]);
    
    // Fetch minimum stake amount
    const fetchMinimumStake = useCallback(async () => {
        if (!stakingContract) return;
        try {
            const minStake = await stakingContract.minimumStake();
            setMinimumStakeAmount(formatEther(minStake));
        } catch (error) {
            console.error("Error fetching minimum stake:", error);
        }
    }, [stakingContract]);
    
    // Fetch total staked amount and calculate APR
    const fetchTotalStaked = useCallback(async () => {
        if (!stakingContract) return;
        try {
            const total = await stakingContract.getTotalStaked();
            const rewardsPerDay = await stakingContract.getRewardsPerDay();
            setTotalStakedAmount(formatEther(total));
            setApr(calculateAPR(formatEther(rewardsPerDay), formatEther(total)));
        } catch (error) {
            console.error("Error fetching total staked:", error);
        }
    }, [stakingContract]);

    // Load contract data
    const loadContractData = useCallback(async () => {
        if (!stakingContract) return;
        try {
            const [userStakeInfo, minStake] = await Promise.all([
                stakingContract.getStakeInfo(),
                stakingContract.getMinimumStakeAmount()
            ]);
            
            setStakeInfo({
                stakedAmount: formatEther(userStakeInfo.amount),
                stakingSince: userStakeInfo.since.toString(),
                rewards: formatEther(userStakeInfo.rewards)
            });
            
            setMinimumStakeAmount(formatEther(minStake));
            await fetchTotalStaked();
        } catch (error) {
            console.error("Error loading contract data:", error);
        }
    }, [stakingContract, fetchTotalStaked]);
    
    // Load data when contract is initialized
    useEffect(() => {
        if (stakingContract) {
            loadContractData();
        }
    }, [stakingContract, loadContractData]);

    // Stake tokens
    const stake = async (amount) => {
        if (!stakingContract) return;
        
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            throw new Error("Please enter a valid amount to stake");
        }
        
        // Check minimum stake
        if (parseFloat(amount) < parseFloat(minimumStakeAmount)) {
            throw new Error(`Minimum stake amount is ${minimumStakeAmount} AVAX`);
        }
        
        setIsLoading(true);
        try {
            // Estimate gas to provide better UX
            const gasEstimate = await stakingContract.estimateGas.stake(parseEther(amount));
            const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
            
            const tx = await stakingContract.stake(parseEther(amount), { gasLimit });
            await tx.wait();
            await loadContractData();
            return tx;
        } catch (error) {
            console.error("Error staking:", error);
            if (error.code === 'INSUFFICIENT_FUNDS') {
                throw new Error("Insufficient funds to complete this transaction");
            } else if (error.message.includes("user rejected")) {
                throw new Error("Transaction was rejected");
            } else {
                throw new Error(`Staking failed: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Withdraw tokens
    const withdraw = async (amount) => {
        if (!stakingContract) return;
        
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            throw new Error("Please enter a valid amount to withdraw");
        }
        
        // Check if user has enough staked
        if (parseFloat(amount) > parseFloat(stakeInfo.stakedAmount)) {
            throw new Error(`You can only withdraw up to ${stakeInfo.stakedAmount} AVAX`);
        }
        
        setIsLoading(true);
        try {
            // Estimate gas to provide better UX
            const gasEstimate = await stakingContract.estimateGas.withdraw(parseEther(amount));
            const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
            
            const tx = await stakingContract.withdraw(parseEther(amount), { gasLimit });
            await tx.wait();
            await loadContractData();
            return tx;
        } catch (error) {
            console.error("Error withdrawing:", error);
            if (error.message.includes("user rejected")) {
                throw new Error("Transaction was rejected");
            } else {
                throw new Error(`Withdrawal failed: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Claim rewards
    const claimRewards = async () => {
        if (!stakingContract) return;
        
        // Check if there are rewards to claim
        if (parseFloat(stakeInfo.rewards) <= 0) {
            throw new Error("No rewards available to claim");
        }
        
        setIsLoading(true);
        try {
            // Estimate gas to provide better UX
            const gasEstimate = await stakingContract.estimateGas.claimRewards();
            const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
            
            const tx = await stakingContract.claimRewards({ gasLimit });
            await tx.wait();
            await loadContractData();
            return tx;
        } catch (error) {
            console.error("Error claiming rewards:", error);
            if (error.message.includes("user rejected")) {
                throw new Error("Transaction was rejected");
            } else {
                throw new Error(`Claiming rewards failed: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        stakeInfo,
        isLoading,
        networkError,
        apr,
        minimumStakeAmount,
        totalStakedAmount,
        transactionHistory,
        stake,
        withdraw,
        claimRewards,
        refreshStakeInfo,
        loadContractData
    };
};