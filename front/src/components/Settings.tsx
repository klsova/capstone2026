import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, Divider } from '@mui/material';

const Settings = () => {
  const [mbqDivider, setMbqDivider] = useState('34.280');

  const handleSave = () => {
    alert(`New MBq divider constant (${mbqDivider}) saved! (Demo)`);
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

        <Divider sx={{ mb: 4 }} />

        <Stack spacing={4}>
          <TextField
            label="MBq Divider Constant"
            type="number"
            variant="outlined"
            value={mbqDivider}
            onChange={(e) => setMbqDivider(e.target.value)}
            fullWidth
            helperText="Current default value: 34.280"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
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
        </Stack>
      </Paper>
    </Box>
  );
};

export default Settings;
