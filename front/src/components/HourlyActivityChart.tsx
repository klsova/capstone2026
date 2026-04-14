import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';

// Mielivaltaista testidataa
const data = [
  { hour: '08:00', aurum: 120, pc1: 210, pc2: 80 },
  { hour: '09:00', aurum: 150, pc1: 180, pc2: 120 },
  { hour: '10:00', aurum: 180, pc1: 250, pc2: 150 },
  { hour: '11:00', aurum: 220, pc1: 310, pc2: 110 },
  { hour: '12:00', aurum: 200, pc1: 240, pc2: 190 },
];

const HourlyActivityChart = () => {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="hour" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            contentStyle={{
              borderRadius: '8ppx',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
          />
          <Bar
            dataKey="aurum"
            name="Aurum"
            fill="#1db954" // Vihreä
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="pc1"
            name="PC1"
            fill="#b2a100" // Vihreä
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="pc2"
            name="PC2"
            fill="#c26a00" // Vihreä
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HourlyActivityChart;
