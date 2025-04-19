import { useEffect, useState } from "react";
import StakingForm from "./components/StakingForm";
import StakeDashboard from "./components/StakeDashboard";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask.");
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsConnected(accounts.length > 0);
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
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
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity transform hover:scale-105 duration-200 shadow-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>

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
      </div>
    </div>
  );
}

export default App;