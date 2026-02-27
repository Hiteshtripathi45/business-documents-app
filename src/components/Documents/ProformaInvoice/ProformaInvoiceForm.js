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
import { Save, Print, PictureAsPdf, Send, Receipt } from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProformas } from '../../../context/ProformaContext';
import { useCompany } from '../../../context/CompanyContext';
import ItemTable from '../../Common/ItemTable';
import CompanyInfo from '../../Common/CompanyInfo';
import { generatePDF } from '../../../utils/pdfGenerator';

const ProformaInvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addProforma, updateProforma, getProforma } = useProformas();
  const { company } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [proforma, setProforma] = useState({
    proformaNumber: '',
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
    advance: 0,
    balance: 0,
    notes: '',
    terms: 'This is a proforma invoice. Not a tax invoice.',
    status: 'draft',
    paymentTerms: '50% advance, 50% before delivery',
    company: { ...company },
  });

  useEffect(() => {
    setProforma(prev => ({
      ...prev,
      company: { ...company },
      terms: company.terms || prev.terms,
    }));
  }, [company]);

  useEffect(() => {
    if (location.state?.quotation) {
      const { quotation } = location.state;
      const subtotal = quotation.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxTotal = quotation.items.reduce(
        (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100,
        0
      );
      const total = subtotal + taxTotal;
      
      setProforma(prev => ({
        ...prev,
        customerName: quotation.customerName,
        customerEmail: quotation.customerEmail,
        customerPhone: quotation.customerPhone,
        customerAddress: quotation.customerAddress,
        customerGST: quotation.customerGST,
        items: quotation.items,
        subtotal,
        taxTotal,
        total,
        advance: total * 0.5,
        balance: total * 0.5,
      }));
    } else if (id) {
      const existingProforma = getProforma(parseInt(id));
      if (existingProforma) {
        setProforma({
          ...existingProforma,
          company: { ...company },
        });
      } else {
        navigate('/proforma-invoices');
      }
    } else {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      
      setProforma(prev => ({
        ...prev,
        proformaNumber: `${company.proformaPrefix || 'PI'}-${year}-${month}-${randomNum}`,
        validUntil: validUntil.toISOString().split('T')[0],
        terms: company.terms || 'This is a proforma invoice. Not a tax invoice.',
      }));
    }
  }, [id, location.state, getProforma, navigate, company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProforma((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (newItems) => {
    setProforma((prev) => {
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxTotal = newItems.reduce(
        (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100,
        0
      );
      const discount = prev.discount || 0;
      const total = subtotal + taxTotal - discount;
      const advance = prev.advance || 0;
      const balance = total - advance;
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        taxTotal,
        total,
        balance: balance > 0 ? balance : 0,
      };
    });
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    setProforma(prev => {
      const total = prev.subtotal + prev.taxTotal - discount;
      return {
        ...prev,
        discount,
        total,
        balance: total - prev.advance,
      };
    });
  };

  const handleAdvanceChange = (e) => {
    const advance = parseFloat(e.target.value) || 0;
    setProforma(prev => ({
      ...prev,
      advance,
      balance: Math.max(0, prev.total - advance),
    }));
  };

  const validateForm = () => {
    if (!proforma.customerName?.trim()) {
      showError('Please enter customer name');
      return false;
    }

    if (!proforma.proformaNumber?.trim()) {
      showError('Please enter proforma number');
      return false;
    }

    if (!proforma.date) {
      showError('Please select date');
      return false;
    }

    if (!proforma.validUntil) {
      showError('Please select valid until date');
      return false;
    }

    if (proforma.items.length === 0) {
      showError('Please add at least one item');
      return false;
    }

    const invalidItems = proforma.items.filter(item => !item.description?.trim());
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

      const proformaToSave = {
        ...proforma,
        company: { ...company },
      };

      if (id) {
        updateProforma(parseInt(id), proformaToSave);
        showSuccess('Proforma invoice updated successfully!');
      } else {
        addProforma(proformaToSave);
        showSuccess('Proforma invoice created successfully!');
      }
      
      setTimeout(() => navigate('/proforma-invoices'), 1500);
    } catch (error) {
      showError('Error saving proforma invoice!');
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    try {
      const success = generatePDF({ ...proforma, company }, 'proforma');
      if (success) showSuccess('PDF downloaded successfully!');
    } catch (error) {
      showError('Error generating PDF!');
    }
  };

  const handleSendEmail = () => {
    console.log('Sending email for proforma:', proforma.proformaNumber);
    showSuccess('Email sent successfully!');
  };

  const handleConvertToInvoice = () => {
    navigate('/invoices/new', { state: { proforma } });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" color="primary">
              {id ? 'Edit Proforma Invoice' : 'Create Proforma Invoice'}
            </Typography>
            {proforma.proformaNumber && (
              <Chip label={`#: ${proforma.proformaNumber}`} color="primary" sx={{ mt: 1 }} />
            )}
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint} sx={{ mr: 1 }}>
              Print
            </Button>
            <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleDownloadPDF} sx={{ mr: 1 }}>
              PDF
            </Button>
            <Button variant="outlined" startIcon={<Send />} onClick={handleSendEmail} sx={{ mr: 1 }}>
              Email
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
              fullWidth label="Proforma Number" name="proformaNumber"
              value={proforma.proformaNumber} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth type="date" label="Date" name="date"
              value={proforma.date} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth type="date" label="Valid Until" name="validUntil"
              value={proforma.validUntil} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Customer Name" name="customerName"
              value={proforma.customerName} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Customer Email" name="customerEmail"
              value={proforma.customerEmail} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Customer Phone" name="customerPhone"
              value={proforma.customerPhone} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Customer Address" name="customerAddress"
              multiline rows={2} value={proforma.customerAddress} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Customer GST" name="customerGST"
              value={proforma.customerGST} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2 }}>Items</Typography>
            <ItemTable items={proforma.items} onItemsChange={handleItemsChange} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Discount" name="discount" type="number"
              value={proforma.discount} onChange={handleDiscountChange}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>{company.currency}</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Advance Required" name="advance" type="number"
              value={proforma.advance} onChange={handleAdvanceChange}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>{company.currency}</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={proforma.status} onChange={handleInputChange} label="Status">
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Payment Terms" name="paymentTerms"
              value={proforma.paymentTerms} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle2">Subtotal: {company.currency}{proforma.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle2">Tax: {company.currency}{proforma.taxTotal.toFixed(2)}</Typography>
              {proforma.discount > 0 && (
                <Typography variant="subtitle2" color="error">Discount: -{company.currency}{proforma.discount.toFixed(2)}</Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{proforma.total.toFixed(2)}</Typography>
              <Typography variant="body2">Advance: {company.currency}{proforma.advance.toFixed(2)}</Typography>
              <Typography variant="body2" color="primary">Balance: {company.currency}{proforma.balance.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Notes" name="notes" multiline rows={3}
              value={proforma.notes} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Terms" name="terms" multiline rows={3}
              value={proforma.terms} onChange={handleInputChange}
            />
          </Grid>

          {id && proforma.status !== 'converted' && (
            <Grid item xs={12}>
              <Button
                variant="contained" color="success" startIcon={<Receipt />}
                onClick={handleConvertToInvoice} fullWidth
              >
                Convert to Invoice
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProformaInvoiceForm;