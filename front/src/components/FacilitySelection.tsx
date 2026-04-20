import React, { useState } from 'react';
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
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

const FacilitySelection = () => {
  const navigate = useNavigate();

  const [facility, setFacility] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs('2025-07-18'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs('2025-07-20'));

  const handleStart = () => {
    if (facility && startDate && endDate) {
      navigate('/dashboard', {
        state: {
          facility,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
    } else {
      alert('Choose a facility and time frame');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                <MenuItem value="Aurum">Aurum</MenuItem>
                <MenuItem value="PET_Downstairs">PET Centre Downstairs</MenuItem>
                <MenuItem value="PET_Upstairs">PET Centre Upstairs</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
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
