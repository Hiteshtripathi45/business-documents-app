import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Chip,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material';
import { Save, Print, PictureAsPdf, Add, Delete } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEChallans } from '../../../context/EChallanContext';
import { useCompany } from '../../../context/CompanyContext';
import CompanyInfo from '../../Common/CompanyInfo';
import { generatePDF } from '../../../utils/pdfGenerator';

const EChallanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addChallan, updateChallan, getChallan } = useEChallans();
  const { company } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [challan, setChallan] = useState({
    challanNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    type: 'outward',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerGST: '',
    transporterName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    fromLocation: '',
    toLocation: '',
    items: [],
    subtotal: 0,
    taxTotal: 0,
    total: 0,
    notes: '',
    status: 'pending',
    deliveryDate: '',
    receivedBy: '',
    company: { ...company },
  });

  useEffect(() => {
    setChallan(prev => ({
      ...prev,
      company: { ...company },
    }));
  }, [company]);

  useEffect(() => {
    if (id) {
      const existing = getChallan(parseInt(id));
      if (existing) {
        setChallan({
          ...existing,
          company: { ...company },
        });
      } else {
        navigate('/e-challans');
      }
    } else {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      
      setChallan(prev => ({
        ...prev,
        challanNumber: `${company.challanPrefix || 'CHL'}-${year}-${month}-${randomNum}`,
      }));
    }
  }, [id, getChallan, navigate, company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChallan(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setChallan(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          tax: 0,
          amount: 0,
        },
      ],
    }));
  };

  const handleItemChange = (id, field, value) => {
    setChallan(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.amount = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
          }
          return updatedItem;
        }
        return item;
      });

      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxTotal = updatedItems.reduce(
        (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100,
        0
      );

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        taxTotal,
        total: subtotal + taxTotal,
      };
    });
  };

  const handleRemoveItem = (id) => {
    setChallan(prev => {
      const updatedItems = prev.items.filter(item => item.id !== id);
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxTotal = updatedItems.reduce(
        (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100,
        0
      );

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        taxTotal,
        total: subtotal + taxTotal,
      };
    });
  };

  const validateForm = () => {
    if (!challan.customerName?.trim()) {
      showError('Please enter customer name');
      return false;
    }
    if (!challan.challanNumber?.trim()) {
      showError('Please enter challan number');
      return false;
    }
    if (!challan.date) {
      showError('Please select date');
      return false;
    }
    if (!challan.fromLocation?.trim()) {
      showError('Please enter from location');
      return false;
    }
    if (!challan.toLocation?.trim()) {
      showError('Please enter to location');
      return false;
    }
    if (!challan.vehicleNumber?.trim()) {
      showError('Please enter vehicle number');
      return false;
    }
    if (challan.items.length === 0) {
      showError('Please add at least one item');
      return false;
    }
    const invalidItems = challan.items.filter(item => !item.description?.trim());
    if (invalidItems.length > 0) {
      showError('Please enter description for all items');
      return false;
    }
    return true;
  };

  const showError = (message) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const showSuccess = (message) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const handleSave = () => {
    try {
      if (!validateForm()) return;

      const toSave = {
        ...challan,
        company: { ...company },
      };

      if (id) {
        updateChallan(parseInt(id), toSave);
        showSuccess('E-Challan updated successfully!');
      } else {
        addChallan(toSave);
        showSuccess('E-Challan created successfully!');
      }
      
      setTimeout(() => navigate('/e-challans'), 1500);
    } catch (error) {
      showError('Error saving e-challan!');
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...challan, company }, 'challan');
      showSuccess('PDF downloaded successfully!');
    } catch (error) {
      showError('Error generating PDF!');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" color="primary">
              {id ? 'Edit E-Challan' : 'New E-Challan'}
            </Typography>
            {challan.challanNumber && (
              <Chip label={`#: ${challan.challanNumber}`} color="primary" sx={{ mt: 1 }} />
            )}
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint} sx={{ mr: 1 }}>
              Print
            </Button>
            <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleDownloadPDF} sx={{ mr: 1 }}>
              PDF
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CompanyInfo />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Challan Number" name="challanNumber"
              value={challan.challanNumber} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth type="date" label="Date" name="date"
              value={challan.date} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth type="time" label="Time" name="time"
              value={challan.time} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select name="type" value={challan.type} onChange={handleInputChange} label="Type">
                <MenuItem value="outward">Outward</MenuItem>
                <MenuItem value="inward">Inward</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={challan.status} onChange={handleInputChange} label="Status">
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-transit">In Transit</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Customer Name" name="customerName"
              value={challan.customerName} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Customer Phone" name="customerPhone"
              value={challan.customerPhone} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Customer GST" name="customerGST"
              value={challan.customerGST} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Customer Address" name="customerAddress"
              multiline rows={2} value={challan.customerAddress} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Transporter Name" name="transporterName"
              value={challan.transporterName} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Vehicle Number" name="vehicleNumber"
              value={challan.vehicleNumber} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth type="date" label="Delivery Date" name="deliveryDate"
              value={challan.deliveryDate} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Driver Name" name="driverName"
              value={challan.driverName} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Driver Phone" name="driverPhone"
              value={challan.driverPhone} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Received By" name="receivedBy"
              value={challan.receivedBy} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="From Location" name="fromLocation"
              value={challan.fromLocation} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="To Location" name="toLocation"
              value={challan.toLocation} onChange={handleInputChange} required
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Items</Typography>
              <Button variant="outlined" startIcon={<Add />} onClick={handleAddItem} size="small">
                Add Item
              </Button>
            </Box>
            
            {challan.items.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
                <Typography color="textSecondary">No items added</Typography>
                <Button onClick={handleAddItem} sx={{ mt: 1 }}>Add your first item</Button>
              </Paper>
            ) : (
              challan.items.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth size="small" label="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth size="small" type="number" label="Quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth size="small" type="number" label="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }}>{company.currency}</Typography> }}
                      />
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <TextField
                        fullWidth size="small" type="number" label="Tax %"
                        value={item.tax}
                        onChange={(e) => handleItemChange(item.id, 'tax', parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={4} md={2}>
                      <Typography variant="body2" color="primary">
                        {company.currency}{item.amount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={2} md={1}>
                      <IconButton color="error" onClick={() => handleRemoveItem(item.id)} size="small">
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            )}
          </Grid>

          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="h6">{company.currency}{challan.subtotal.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Tax Total:</Typography>
                  <Typography variant="h6">{company.currency}{challan.taxTotal.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">Total Value:</Typography>
                  <Typography variant="h6" color="primary">{company.currency}{challan.total.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth label="Notes" name="notes" multiline rows={3}
              value={challan.notes} onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default EChallanForm;