import { useEffect } from 'react';
import { useStaking } from '../hooks/useStaking';
import { getExplorerUrl } from '../utils/web3';

const StakeDashboard = () => {
    const { 
        stakeInfo, 
        refreshStakeInfo, 
        apr, 
        totalStakedAmount, 
        transactionHistory,
        loadContractData
    } = useStaking();

    useEffect(() => {
        // Initial data load
        loadContractData();
        
        // Set up refresh interval
        const interval = setInterval(() => {
            refreshStakeInfo();
        }, 15000); // Refresh every 15 seconds
        
        return () => clearInterval(interval);
    }, [refreshStakeInfo, loadContractData]);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Your Stake</h3>
                    <div className="text-3xl font-bold text-orange-500">
                        {stakeInfo.stakedAmount} AVAX
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        {stakeInfo.stakingSince !== "Not staked yet" 
                            ? `Since: ${stakeInfo.stakingSince}` 
                            : "You haven't staked yet"}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Available Rewards</h3>
                    <div className="text-3xl font-bold text-green-500">
                        {stakeInfo.rewards} AVAX
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        Current APR: {apr}%
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">Total Value Locked</h3>
                    <div className="text-3xl font-bold text-blue-500">
                        {totalStakedAmount} AVAX
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        Platform Total
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
                
                {transactionHistory.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                        No transactions yet
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Time</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Transaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionHistory.map((tx, index) => (
                                    <tr key={index} className="border-b border-gray-700">
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                tx.type === 'Stake' 
                                                    ? 'bg-orange-900/50 text-orange-300' 
                                                    : tx.type === 'Withdraw' 
                                                        ? 'bg-red-900/50 text-red-300' 
                                                        : 'bg-green-900/50 text-green-300'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{tx.amount} AVAX</td>
                                        <td className="px-4 py-3 text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <a 
                                                href={getExplorerUrl(tx.transactionHash)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 underline"
                                            >
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Staking Info */}
            <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Staking Information</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-lg font-medium mb-2">How Rewards Work</h4>
                        <p className="text-gray-300">
                            Rewards are calculated based on your staked amount, the current APR, and the duration of your stake.
                            The longer you stake, the more rewards you'll earn.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-medium mb-2">Avalanche Network</h4>
                        <p className="text-gray-300">
                            This staking platform operates on the Avalanche network, known for its high throughput and low fees.
                            Make sure your wallet is connected to the Avalanche network to interact with the staking contract.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StakeDashboard;