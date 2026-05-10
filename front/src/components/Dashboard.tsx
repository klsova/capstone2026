import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import Charts from './Charts';
import dayjs from 'dayjs';
import { fetchEmissionData } from '../services/emissionService';
import { exportToExcel } from '../utils/exportUtils';
import { useData } from '../context/DataContext';

const Dashboard = () => {
  const {
    facility,
    startDate,
    endDate,
    emissionsData,
    setEmissionsData,
    peaksData,
    setPeaksData,
  } = useData();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emissionsData.length > 0) return;
    if (facility === 'Not Selected' || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    fetchEmissionData(facility, startDate, endDate)
      .then((data) => {
        setEmissionsData(data.emissions || []);
        setPeaksData(data.peaks || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Data fetching from server failed.');
      })
      .finally(() => setLoading(false));
  }, [
    facility,
    startDate,
    endDate,
    emissionsData.length,
    setEmissionsData,
    setPeaksData,
  ]);

  const handleExport = () => {
    exportToExcel(peaksData, facility);
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Dashboard: {facility}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
          >
            Time range: {dayjs(startDate).format('DD.MM.YYYY')} -{' '}
            {dayjs(endDate).format('DD.MM.YYYY')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={peaksData.length === 0 || loading}
          sx={{ bgcolor: '#60c9f8', '&:hover': { bgcolor: '#4fb8e7' }, px: 4, py: 1 }}
        >
          Export
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Charts
          facility={facility}
          startDate={startDate}
          endDate={endDate}
          emissionsData={emissionsData}
          peaksData={peaksData}
        />
      )}
    </Box>
  );
};

export default Dashboard;
