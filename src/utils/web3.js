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

// Avalanche Mainnet
export const AVALANCHE_MAINNET_PARAMS = {
    chainId: '0xA86A', // 43114 in hexadecimal
    chainName: 'Avalanche Mainnet C-Chain',
    nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io/']
};

// Avalanche Fuji Testnet
export const AVALANCHE_FUJI_PARAMS = {
    chainId: '0xA869', // 43113 in hexadecimal
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/']
};

export const switchToAvalancheNetwork = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    
    try {
        // Try to switch to the Avalanche Fuji Testnet
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: AVALANCHE_FUJI_PARAMS.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [AVALANCHE_FUJI_PARAMS],
                });
            } catch (addError) {
                throw new Error("Failed to add Avalanche Fuji Testnet");
            }
        }
    }
};

export const getExplorerUrl = (txHash) => {
    return `https://testnet.snowtrace.io/tx/${txHash}`;
};