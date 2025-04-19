import { BrowserProvider, Contract, parseEther } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

// Function to get the contract instance
export const getContract = async () => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } catch (error) {
    console.error("Error getting contract:", error);
    return null;
  }
};

// Function to stake tokens
export const stakeTokens = async (amount) => {
  const contract = await getContract();
  if (!contract) return;

  try {
    const tx = await contract.stake({ value: parseEther(amount) });
    await tx.wait(); // Wait for transaction confirmation
    console.log("Tokens staked successfully!");
  } catch (error) {
    console.error("Error staking tokens:", error);
  }
};
