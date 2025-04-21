import { useState } from 'react';
import { calculateAPR } from '../utils/web3';

const APRCalculator = () => {
    const [rewardsPerDay, setRewardsPerDay] = useState('');
    const [totalStaked, setTotalStaked] = useState('');
    const [calculatedAPR, setCalculatedAPR] = useState('0');

    const handleCalculate = (e) => {
        e.preventDefault();
        const apr = calculateAPR(rewardsPerDay, totalStaked);
        setCalculatedAPR(apr);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-auto mt-6">
            <h2 className="text-2xl font-bold mb-6 text-center">APR Calculator</h2>
            
            <form onSubmit={handleCalculate}>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                        Daily Rewards (AVAX)
                    </label>
                    <input
                        type="number"
                        step="0.000001"
                        value={rewardsPerDay}
                        onChange={(e) => setRewardsPerDay(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter daily rewards"
                        required
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-gray-300 mb-2">
                        Total Staked (AVAX)
                    </label>
                    <input
                        type="number"
                        step="0.000001"
                        value={totalStaked}
                        onChange={(e) => setTotalStaked(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter total staked amount"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Calculate APR
                </button>
            </form>

            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Estimated APR</span>
                    <span className="text-2xl font-bold text-green-400">{calculatedAPR}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Note: This is an estimate based on current rewards and total staked amount. 
                    Actual returns may vary.
                </p>
            </div>
        </div>
    );
};

export default APRCalculator;