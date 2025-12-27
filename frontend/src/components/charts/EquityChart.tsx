
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EquityCurvePoint } from '../../types/Trade';
import { analyticsUtils } from '../../utils/analytics';

interface EquityChartProps {
    data: EquityCurvePoint[];
}

export const EquityChart: React.FC<EquityChartProps> = ({ data }) => {
    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        minTickGap={30}
                    />
                    <YAxis
                        tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                        formatter={(value: number | undefined) => [value !== undefined ? analyticsUtils.formatCurrency(value) : '$0.00', 'Equity']}
                        labelFormatter={(label) => new Date(label).toDateString()}
                    />
                    <Area
                        type="monotone"
                        dataKey="cumulative_pnl"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorPnL)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
