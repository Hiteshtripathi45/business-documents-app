import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useCompany } from '../../context/CompanyContext';

const CompanyInfo = () => {
  const { company } = useCompany();
  
  console.log('CompanyInfo rendering with:', company); // Debug log

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        mb: 2, 
        bgcolor: '#f8f9fa',
        borderLeft: '4px solid #1976d2'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <BusinessIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Grid>
        <Grid item xs>
          <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            {company.name || 'Your Company Name'}
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {company.address || '123 Business Street, City, State - 123456'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Phone:</strong> {company.phone || '+91 1234567890'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Email:</strong> {company.email || 'info@company.com'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>GST:</strong> {company.gst || '22AAAAA0000A1Z5'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>PAN:</strong> {company.pan || 'AAAAA1234A'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CompanyInfo;