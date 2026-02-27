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
} from '@mui/material';
import { Save, Print, PictureAsPdf } from '@mui/icons-material'; // Removed Send
import { useParams, useNavigate } from 'react-router-dom';
import { useQuotations } from '../../../context/QuotationContext';
import { useCompany } from '../../../context/CompanyContext';
import ItemTable from '../../Common/ItemTable';
import CompanyInfo from '../../Common/CompanyInfo';
import { generatePDF } from '../../../utils/pdfGenerator';

// Rest of the component remains the same...

const QuotationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addQuotation, updateQuotation, getQuotation } = useQuotations();
  const { company } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [quotation, setQuotation] = useState({
    quotationNumber: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGST: '',
    items: [],
    subtotal: 0,
    taxTotal: 0,
    discount: 0,
    total: 0,
    notes: '',
    terms: '',
    status: 'draft',
    paymentTerms: '',
    deliveryTerms: '',
    company: { ...company },
  });

  useEffect(() => {
    setQuotation(prev => ({
      ...prev,
      company: { ...company },
    }));
  }, [company]);

  useEffect(() => {
    if (id) {
      const existing = getQuotation(parseInt(id));
      if (existing) {
        setQuotation({
          ...existing,
          company: { ...company },
        });
      } else {
        navigate('/quotations');
      }
    } else {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      
      setQuotation(prev => ({
        ...prev,
        quotationNumber: `${company.quotationPrefix || 'QTN'}-${year}-${month}-${randomNum}`,
        validUntil: validUntil.toISOString().split('T')[0],
        terms: company.terms || '',
      }));
    }
  }, [id, getQuotation, navigate, company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuotation(prev => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (newItems) => {
    setQuotation(prev => {
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxTotal = newItems.reduce(
        (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100,
        0
      );
      const total = subtotal + taxTotal - (prev.discount || 0);
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        taxTotal,
        total,
      };
    });
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    setQuotation(prev => ({
      ...prev,
      discount,
      total: prev.subtotal + prev.taxTotal - discount,
    }));
  };

  const validateForm = () => {
    if (!quotation.customerName?.trim()) {
      showError('Please enter customer name');
      return false;
    }
    if (!quotation.quotationNumber?.trim()) {
      showError('Please enter quotation number');
      return false;
    }
    if (!quotation.date) {
      showError('Please select date');
      return false;
    }
    if (!quotation.validUntil) {
      showError('Please select valid until date');
      return false;
    }
    if (quotation.items.length === 0) {
      showError('Please add at least one item');
      return false;
    }
    const invalidItems = quotation.items.filter(item => !item.description?.trim());
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
        ...quotation,
        company: { ...company },
      };

      if (id) {
        updateQuotation(parseInt(id), toSave);
        showSuccess('Quotation updated successfully!');
      } else {
        addQuotation(toSave);
        showSuccess('Quotation created successfully!');
      }
      
      setTimeout(() => navigate('/quotations'), 1500);
    } catch (error) {
      showError('Error saving quotation!');
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...quotation, company }, 'quotation');
      showSuccess('PDF downloaded successfully!');
    } catch (error) {
      showError('Error generating PDF!');
    }
  };

  const totals = {
    subtotal: quotation.items.reduce((sum, item) => sum + (item.amount || 0), 0),
    taxTotal: quotation.items.reduce(
      (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100, 0
    ),
  };
  totals.total = totals.subtotal + totals.taxTotal - (quotation.discount || 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" color="primary">
              {id ? 'Edit Quotation' : 'New Quotation'}
            </Typography>
            {quotation.quotationNumber && (
              <Chip label={`#: ${quotation.quotationNumber}`} color="primary" sx={{ mt: 1 }} />
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

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Quotation Number" name="quotationNumber"
              value={quotation.quotationNumber} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth type="date" label="Date" name="date"
              value={quotation.date} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth type="date" label="Valid Until" name="validUntil"
              value={quotation.validUntil} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Customer Name" name="customerName"
              value={quotation.customerName} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Email" name="customerEmail"
              value={quotation.customerEmail} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Phone" name="customerPhone"
              value={quotation.customerPhone} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Address" name="customerAddress"
              multiline rows={2} value={quotation.customerAddress} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="GST" name="customerGST"
              value={quotation.customerGST} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2 }}>Items</Typography>
            <ItemTable items={quotation.items} onItemsChange={handleItemsChange} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Discount" name="discount" type="number"
              value={quotation.discount} onChange={handleDiscountChange}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>{company.currency}</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Payment Terms" name="paymentTerms"
              value={quotation.paymentTerms} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Delivery Terms" name="deliveryTerms"
              value={quotation.deliveryTerms} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Notes" name="notes" multiline rows={3}
              value={quotation.notes} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle2">Subtotal: {company.currency}{totals.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle2">Tax: {company.currency}{totals.taxTotal.toFixed(2)}</Typography>
              {quotation.discount > 0 && (
                <Typography color="error">Discount: -{company.currency}{quotation.discount.toFixed(2)}</Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{totals.total.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth label="Terms" name="terms" multiline rows={2}
              value={quotation.terms} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={quotation.status} onChange={handleInputChange} label="Status">
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default QuotationForm;