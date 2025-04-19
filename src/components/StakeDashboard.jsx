import { useEffect, useState } from 'react';
import { getProvider } from '../utils/web3';
import { useStaking } from '../hooks/useStaking';

const StakeDashboard = () => {
    const { stakeInfo, refreshStakeInfo } = useStaking();
    const [apr, setApr] = useState('5.00');
    const [totalStaked, setTotalStaked] = useState('0');

    useEffect(() => {
        const interval = setInterval(refreshStakeInfo, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, [refreshStakeInfo]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Your Stake</h3>
                <div className="text-3xl font-bold text-orange-500">
                    {stakeInfo.stakedAmount} AVAX
                </div>
                <div className="text-sm text-gray-400 mt-2">
                    Since: {stakeInfo.stakingSince}
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
                    {totalStaked} AVAX
                </div>
                <div className="text-sm text-gray-400 mt-2">
                    Platform Total
                </div>
            </div>
        </div>
    );
};

export default StakeDashboard;