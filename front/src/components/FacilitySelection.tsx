import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en-gb';
import { useData } from '../context/DataContext';

const FacilitySelection = () => {
  const navigate = useNavigate();

  const {
    setFacility: setGlobalFacility,
    setStartDate: setGlobalStart,
    setEndDate: setGlobalEnd,
    setEmissionsData,
    setPeaksData,
  } = useData();

  const [facility, setFacility] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs('2025-07-18').startOf('day'),
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs('2025-07-20').endOf('day'));

  const handleStart = () => {
    if (facility && startDate && endDate) {
      setGlobalFacility(facility);
      setGlobalStart(startDate.format('YYYY-MM-DDTHH:mm:ss'));
      setGlobalEnd(endDate.format('YYYY-MM-DDTHH:mm:ss'));
      /*       setGlobalStart(startDate.toISOString());
      setGlobalEnd(endDate.toISOString()); */

      setEmissionsData([]);
      setPeaksData([]);

      navigate('/dashboard');
    } else {
      alert('Choose a facility and time frame');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f0f2f5',
        }}
      >
        <Paper elevation={3} sx={{ p: 5, width: 400, borderRadius: 3 }}>
          <Typography
            variant="h5"
            sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}
          >
            Emission Tracking System
          </Typography>

          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Select Facility</InputLabel>
              <Select
                value={facility}
                label="Select Facility"
                onChange={(e) => setFacility(e.target.value)}
              >
                <MenuItem value="aurum">aurum</MenuItem>
                <MenuItem value="rk_2">rk2</MenuItem>
                <MenuItem value="floor_2">2ndfloor</MenuItem>
              </Select>
            </FormControl>

            <DateTimePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              format="DD.MM.YYYY HH:mm"
              ampm={false}
            />

            <DateTimePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              format="DD.MM.YYYY HH:mm"
              ampm={false}
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              sx={{ bgcolor: '#60c9f8', mt: 2 }}
            >
              View Data
            </Button>
          </Stack>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default FacilitySelection;
