import { useState, useEffect, useCallback } from 'react';
import { getContract, formatEther, parseEther, getProvider } from '../utils/web3';

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // You'll add this after deployment

export const useStaking = () => {
    const [stakingContract, setStakingContract] = useState(null);
    const [stakeInfo, setStakeInfo] = useState({
        stakedAmount: "0",
        stakingSince: "0",
        rewards: "0"
    });
    const [isLoading, setIsLoading] = useState(false);

    // Initialize contract
    useEffect(() => {
        const initContract = async () => {
            const provider = getProvider();
            if (provider) {
                const signer = provider.getSigner();
                const contract = getContract(CONTRACT_ADDRESS, signer);
                setStakingContract(contract);
            }
        };
        initContract();
    }, []);

    // Get stake info
    const refreshStakeInfo = useCallback(async () => {
        if (!stakingContract) return;
        try {
            const address = await stakingContract.signer.getAddress();
            const info = await stakingContract.getStakeInfo(address);
            setStakeInfo({
                stakedAmount: formatEther(info.amount),
                stakingSince: new Date(info.since.toNumber() * 1000).toLocaleString(),
                rewards: formatEther(info.rewards)
            });
        } catch (error) {
            console.error("Error fetching stake info:", error);
        }
    }, [stakingContract]);

    // Stake tokens
    const stake = async (amount) => {
        if (!stakingContract) return;
        setIsLoading(true);
        try {
            const tx = await stakingContract.stake(parseEther(amount));
            await tx.wait();
            await refreshStakeInfo();
        } catch (error) {
            console.error("Error staking:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Withdraw tokens
    const withdraw = async (amount) => {
        if (!stakingContract) return;
        setIsLoading(true);
        try {
            const tx = await stakingContract.withdraw(parseEther(amount));
            await tx.wait();
            await refreshStakeInfo();
        } catch (error) {
            console.error("Error withdrawing:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Claim rewards
    const claimRewards = async () => {
        if (!stakingContract) return;
        setIsLoading(true);
        try {
            const tx = await stakingContract.claimRewards();
            await tx.wait();
            await refreshStakeInfo();
        } catch (error) {
            console.error("Error claiming rewards:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        stakeInfo,
        isLoading,
        stake,
        withdraw,
        claimRewards,
        refreshStakeInfo
    };
};