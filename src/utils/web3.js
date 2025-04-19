import { ethers } from 'ethers';
import AvaStakingABI from '../abis/AvaStaking.json';

export const getContract = (address, signer) => {
    return new ethers.Contract(address, AvaStakingABI, signer);
};

export const formatEther = (amount) => {
    return ethers.utils.formatEther(amount);
};

export const parseEther = (amount) => {
    return ethers.utils.parseEther(amount.toString());
};

export const getProvider = () => {
    if (window.ethereum) {
        return new ethers.providers.Web3Provider(window.ethereum);
    }
    return null;
};