import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import { Save, Business, Receipt, LocalShipping, Description } from '@mui/icons-material';
import { useCompany } from '../context/CompanyContext';

const Settings = () => {
  const { company, updateCompany } = useCompany();
  const [tabValue, setTabValue] = useState(0);
  const [success, setSuccess] = useState(false);
  const [localSettings, setLocalSettings] = useState(company);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    updateCompany(localSettings);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<Business />} label="Company Info" />
          <Tab icon={<Receipt />} label="Invoice Settings" />
          <Tab icon={<Description />} label="Document Prefixes" />
          <Tab icon={<LocalShipping />} label="Other Settings" />
        </Tabs>

        {/* Company Info Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="name"
                value={localSettings.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={localSettings.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={localSettings.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={localSettings.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="GST Number"
                name="gst"
                value={localSettings.gst}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="PAN Number"
                name="pan"
                value={localSettings.pan}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        )}

        {/* Invoice Settings Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Currency Symbol"
                name="currency"
                value={localSettings.currency}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Default Tax Rate (%)"
                name="taxRate"
                type="number"
                value={localSettings.taxRate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Terms & Conditions"
                name="terms"
                multiline
                rows={3}
                value={localSettings.terms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Footer Text"
                name="footer"
                multiline
                rows={2}
                value={localSettings.footer}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        )}

        {/* Document Prefixes Tab */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Invoice Prefix"
                name="invoicePrefix"
                value={localSettings.invoicePrefix}
                onChange={handleChange}
                helperText="e.g., INV"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quotation Prefix"
                name="quotationPrefix"
                value={localSettings.quotationPrefix}
                onChange={handleChange}
                helperText="e.g., QTN"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Project Order Prefix"
                name="projectPrefix"
                value={localSettings.projectPrefix}
                onChange={handleChange}
                helperText="e.g., PO"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="E-Challan Prefix"
                name="challanPrefix"
                value={localSettings.challanPrefix}
                onChange={handleChange}
                helperText="e.g., CHL"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Proforma Invoice Prefix"
                name="proformaPrefix"
                value={localSettings.proformaPrefix}
                onChange={handleChange}
                helperText="e.g., PI"
              />
            </Grid>
          </Grid>
        )}

        {/* Other Settings Tab */}
        {tabValue === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.autoSave || false}
                    onChange={handleChange}
                    name="autoSave"
                  />
                }
                label="Auto-save Documents"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.emailNotifications || false}
                    onChange={handleChange}
                    name="emailNotifications"
                  />
                }
                label="Enable Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.showTax || true}
                    onChange={handleChange}
                    name="showTax"
                  />
                }
                label="Show Tax in Documents"
              />
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            size="large"
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;