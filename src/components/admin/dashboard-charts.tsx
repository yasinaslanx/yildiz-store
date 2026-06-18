"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type ChartData = {
  salesTrend: { date: string; amount: number }[];
  revenueDistribution: { name: string; value: number }[];
};

export default function DashboardCharts({ data }: { data: ChartData }) {
  const COLORS = ["#000000", "#a8a29e"]; // Black for B2B, stone-400 for B2C

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{label}</p>
          <p className="text-lg font-black text-stone-900">
            {Number(payload[0].value).toLocaleString("tr-TR")} ₺
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Sales Trend Chart */}
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-black text-stone-900 tracking-tighter">Son 30 Günlük Satış Trendi</h2>
          <p className="text-xs font-medium text-stone-500">Günlük ciro dağılımı</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#a8a29e' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#a8a29e' }} 
                tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#000000" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Distribution Chart */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-black text-stone-900 tracking-tighter">Ciro Dağılımı</h2>
          <p className="text-xs font-medium text-stone-500">Bayi vs Perakende Müşteri</p>
        </div>
        <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.revenueDistribution}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.revenueDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-xl shadow-lg border border-stone-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{payload[0].name}</p>
                        <p className="text-sm font-black text-stone-900">
                          {Number(payload[0].value).toLocaleString("tr-TR")} ₺
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-xs font-bold text-stone-600 ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
