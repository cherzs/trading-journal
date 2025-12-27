
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyticsUtils } from '../../utils/analytics';

interface MonthlyChartProps {
    data: any[]; // The monthly data format from backend
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
    // Transform the object data {1: {...}, 2: {...}} to array for Recharts
    const chartData = Object.values(data).map((month: any) => ({
        name: month.month_name.substring(0, 3),
        pnl: month.performance ? month.performance.total_pnl : 0
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                        formatter={(value: number | undefined) => [analyticsUtils.formatCurrency(value ?? 0), 'P&L']}
                    />
                    <Bar dataKey="pnl">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
