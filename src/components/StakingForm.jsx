import { useState } from 'react';
import { useStaking } from '../hooks/useStaking';

const StakingForm = () => {
    const [amount, setAmount] = useState('');
    const { stake, withdraw, claimRewards, stakeInfo, isLoading } = useStaking();

    const handleStake = async (e) => {
        e.preventDefault();
        try {
            await stake(amount);
            setAmount('');
        } catch (error) {
            alert('Error staking tokens: ' + error.message);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        try {
            await withdraw(amount);
            setAmount('');
        } catch (error) {
            alert('Error withdrawing tokens: ' + error.message);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Stake AVAX</h2>
            
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
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount to stake"
                        className="w-full p-2 rounded bg-gray-700 text-white"
                        min="0"
                        step="0.1"
                    />
                </div>
                
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        Stake
                    </button>
                    <button
                        type="button"
                        onClick={handleWithdraw}
                        disabled={isLoading}
                        className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        Withdraw
                    </button>
                </div>
            </form>

            <button
                onClick={claimRewards}
                disabled={isLoading || stakeInfo.rewards === "0"}
                className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                Claim Rewards
            </button>
        </div>
    );
};

export default StakingForm;
