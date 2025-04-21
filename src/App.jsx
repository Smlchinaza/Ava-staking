import { useEffect, useState } from "react";
import StakingForm from "./components/StakingForm";
import StakeDashboard from "./components/StakeDashboard";
import { useStaking } from "./hooks/useStaking";
import { switchToAvalancheNetwork } from "./utils/web3";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [chainId, setChainId] = useState(null);
  const { networkError } = useStaking();

  const connectWallet = async () => {
    if (window.ethereum) {
      setIsConnecting(true);
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        handleAccountsChanged(accounts);
        
        // Check if we're on Avalanche network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isAvalanche = chainId === '0xA86A' || chainId === '0xA869'; // Mainnet or Fuji testnet
        
        if (!isAvalanche) {
          try {
            await switchToAvalancheNetwork();
          } catch (switchError) {
            console.error("Failed to switch to Avalanche network:", switchError);
          }
        }
        
        setChainId(chainId);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet.");
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setIsConnected(true);
      setWalletAddress(accounts[0]);
    } else {
      setIsConnected(false);
      setWalletAddress("");
    }
  };

  const handleChainChanged = (chainId) => {
    // Handle the new chain
    setChainId(chainId);
    // Reload the page to avoid any errors with chain change mid use
    window.location.reload();
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          handleAccountsChanged(accounts);
          
          // Get current chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chainId);
          
          // Set up event listeners
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };
    
    checkConnection();
    
    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Header with wallet connection */}
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            Avalanche Staking
          </div>
          
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  chainId === '0xA86A' || chainId === '0xA869' 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></span>
                <span>{formatAddress(walletAddress)}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 px-4">
            Avalanche Staking Platform
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Stake your AVAX tokens and earn rewards in the most secure and efficient way
          </p>
          {!isConnected && (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity transform hover:scale-105 duration-200 shadow-lg disabled:opacity-70 flex items-center mx-auto"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : "Connect Wallet"}
            </button>
          )}
        </div>

        {/* Network Error Alert */}
        {networkError && (
          <div className="mb-8 p-4 bg-red-900/50 text-red-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{networkError}</p>
            </div>
            <button 
              onClick={switchToAvalancheNetwork}
              className="mt-2 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Switch to Avalanche Network
            </button>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 px-4">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">High APY</h3>
            <p className="text-gray-400 text-sm sm:text-base">Earn competitive returns on your AVAX tokens</p>
          </div>
          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Secure Staking</h3>
            <p className="text-gray-400 text-sm sm:text-base">Your assets are protected by industry-leading security</p>
          </div>
          <div className="bg-gray-800 p-4 sm:p-6 rounded-xl hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Easy Management</h3>
            <p className="text-gray-400 text-sm sm:text-base">Monitor and manage your stakes with our intuitive dashboard</p>
          </div>
        </div>

        {/* Staking Components */}
        {isConnected && (
          <div className="space-y-6 sm:space-y-8 px-4">
            <StakingForm />
            <StakeDashboard />
          </div>
        )}
        
        {/* Not Connected Message */}
        {!isConnected && (
          <div className="text-center p-8 bg-gray-800/50 rounded-xl max-w-2xl mx-auto">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-4">
              Connect your wallet to start staking AVAX and earning rewards.
              Make sure you're connected to the Avalanche network.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="mt-16 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p> {new Date().getFullYear()} Avalanche Staking Platform. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Built with React and Ethers.js for the Avalanche network.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;