import { useState, useEffect } from 'react';
import { useStaking } from '../hooks/useStaking';
import { getExplorerUrl } from '../utils/web3';

const StakingForm = () => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [txHash, setTxHash] = useState('');
    const { 
        stake, 
        withdraw, 
        claimRewards, 
        stakeInfo, 
        isLoading, 
        networkError,
        minimumStakeAmount,
        apr,
        totalStakedAmount
    } = useStaking();

    // Clear messages after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const validateAmount = (value) => {
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
            return "Please enter a valid amount";
        }
        
        if (parseFloat(value) < parseFloat(minimumStakeAmount)) {
            return `Minimum stake amount is ${minimumStakeAmount} AVAX`;
        }
        
        return "";
    };

    const handleStake = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setTxHash('');
        
        const validationError = validateAmount(amount);
        if (validationError) {
            setError(validationError);
            return;
        }
        
        try {
            const tx = await stake(amount);
            
            // Only set tx hash after we have the transaction object
            if (tx && tx.hash) {
                setTxHash(tx.hash);
            }
            
            // Wait for transaction confirmation
            await tx.wait();
            
            // Only set success after confirmation
            setSuccess(`Successfully staked ${amount} AVAX`);
            setAmount('');
        } catch (error) {
            setError(error.message);
            setTxHash(''); // Clear tx hash if transaction failed
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setTxHash('');
        
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        
        if (parseFloat(amount) > parseFloat(stakeInfo.stakedAmount)) {
            setError(`You can only withdraw up to ${stakeInfo.stakedAmount} AVAX`);
            return;
        }
        
        try {
            const tx = await withdraw(amount);
            setSuccess(`Successfully withdrew ${amount} AVAX`);
            setAmount('');
            setTxHash(tx.hash);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleClaimRewards = async () => {
        setError('');
        setSuccess('');
        setTxHash('');
        
        if (parseFloat(stakeInfo.rewards) <= 0) {
            setError("No rewards available to claim");
            return;
        }
        
        try {
            const tx = await claimRewards();
            setSuccess(`Successfully claimed ${stakeInfo.rewards} AVAX in rewards`);
            setTxHash(tx.hash);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Stake AVAX</h2>
            
            {/* APR Display */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Current APR</span>
                    <span className="text-2xl font-bold text-green-400">{apr}%</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-300">Total Staked</span>
                    <span className="text-lg text-gray-200">{totalStakedAmount} AVAX</span>
                </div>
            </div>
            
            {networkError && (
                <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
                    <p className="font-medium">{networkError}</p>
                </div>
            )}
            
            {error && (
                <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
                    <p className="font-medium">{error}</p>
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-900/50 text-green-200 rounded-lg">
                    <p className="font-medium">{success}</p>
                    {txHash && (
                        <a 
                            href={getExplorerUrl(txHash)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-300 underline text-sm"
                        >
                            View transaction
                        </a>
                    )}
                </div>
            )}
            
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between mb-2">
                    <span>Staked Amount:</span>
                    <span>{stakeInfo.stakedAmount} AVAX</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Available Rewards:</span>
                    <span>{stakeInfo.rewards} AVAX</span>
                </div>
                <div className="flex justify-between">
                    <span>Staking Since:</span>
                    <span>{stakeInfo.stakingSince}</span>
                </div>
            </div>

            <form onSubmit={handleStake} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Amount (AVAX)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setError('');
                            }}
                            placeholder={`Min: ${minimumStakeAmount} AVAX`}
                            className="w-full p-2 rounded bg-gray-700 text-white pr-16"
                            min="0"
                            step="0.01"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-600 px-2 py-1 rounded"
                            onClick={() => setAmount(stakeInfo.stakedAmount)}
                        >
                            MAX
                        </button>
                    </div>
                    {minimumStakeAmount && (
                        <p className="text-xs text-gray-400 mt-1">
                            Minimum stake: {minimumStakeAmount} AVAX
                        </p>
                    )}
                </div>
                
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing
                            </>
                        ) : "Stake"}
                    </button>
                    <button
                        type="button"
                        onClick={handleWithdraw}
                        disabled={isLoading || parseFloat(stakeInfo.stakedAmount) <= 0}
                        className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing
                            </>
                        ) : "Withdraw"}
                    </button>
                </div>
            </form>

            <button
                onClick={handleClaimRewards}
                disabled={isLoading || parseFloat(stakeInfo.rewards) <= 0}
                className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex justify-center items-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                    </>
                ) : `Claim ${stakeInfo.rewards} AVAX Rewards`}
            </button>
            
            <div className="mt-4 text-xs text-gray-400">
                <p>Note: All transactions require gas fees paid in AVAX.</p>
                <p>Make sure you have enough AVAX to cover both your stake and gas fees.</p>
            </div>
        </div>
    );
};

export default StakingForm;
