import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
} from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import type { TransitionProps } from '@mui/material/transitions';

interface ChartCardProps {
  title: string;
  height: number;
  children: React.ReactNode;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChartCard: React.FC<ChartCardProps> = ({ title, height, children }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <>
      {/*Normal view on dashboard*/}
      <Paper
        sx={{
          p: 3,
          height,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>

          <IconButton
            onClick={() => setIsMaximized(true)}
            size="small"
            sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}
          >
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>{children}</Box>
      </Paper>

      {/* Enlarged view */}
      <Dialog
        fullScreen
        open={isMaximized}
        onClose={() => setIsMaximized(false)}
        TransitionComponent={Transition}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title} - Detailed View
          </Typography>
          <IconButton onClick={() => setIsMaximized(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{ p: 4, height: '90vh', display: 'flex', flexDirection: 'column' }}
        >
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChartCard;
