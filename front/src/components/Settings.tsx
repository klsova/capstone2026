import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import { useData } from '../context/DataContext';
import { saveMbqConstant } from '../services/emissionService';

const Settings = () => {
  const { facility, mbqConstant, setMbqConstant } = useData();
  const [localDivider, setLocalDivider] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const isValidFacility = facility && facility !== 'Not Selected';

  useEffect(() => {
    if (mbqConstant) {
      setLocalDivider(mbqConstant.toString());
    }
  }, [mbqConstant]);

  const handleSave = async () => {
    if (!isValidFacility) {
      setStatusMsg('Facility not selected');
      return;
    }

    try {
      const numericValue = parseFloat(localDivider);
      await saveMbqConstant(facility, numericValue);
      setMbqConstant(numericValue);
      setStatusMsg(`Successfully updated constant for ${facility} to ${numericValue}`);
    } catch (e) {
      setStatusMsg('Error trying to save the constant to the server.');
    }
  };

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: '#f9fafb' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}>
        Settings
      </Typography>

      <Paper elevation={2} sx={{ p: 4, maxWidth: 600, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Data Calculation Constants
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Current facility: <strong>{facility || 'Not selected'}</strong>
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Stack spacing={4}>
          <TextField
            label="MBq Divider Constant"
            type="number"
            variant="outlined"
            value={localDivider}
            onChange={(e) => setLocalDivider(e.target.value)}
            fullWidth
            disabled={!isValidFacility}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={!isValidFacility}
              sx={{
                bgcolor: '#60c9f8',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                '&:hover': { bgcolor: '#4ab2df' },
              }}
            >
              Save Changes
            </Button>
          </Box>
          {statusMsg && <Alert severity="info">{statusMsg}</Alert>}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Settings;
