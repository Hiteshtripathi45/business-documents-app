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
import { Save, Print, PictureAsPdf, Send } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../../../context/InvoiceContext';
import { useCompany } from '../../../context/CompanyContext';
import ItemTable from '../../Common/ItemTable';
import CompanyInfo from '../../Common/CompanyInfo';
import { generatePDF } from '../../../utils/pdfGenerator';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addInvoice, updateInvoice, getInvoice } = useInvoices();
  const { company } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
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
    company: { ...company },
  });

  useEffect(() => {
    setInvoice(prev => ({
      ...prev,
      company: { ...company },
      terms: company.terms || prev.terms,
    }));
  }, [company]);

  useEffect(() => {
    if (id) {
      const existing = getInvoice(parseInt(id));
      if (existing) {
        setInvoice({
          ...existing,
          company: { ...company },
        });
      } else {
        navigate('/invoices');
      }
    } else {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      setInvoice(prev => ({
        ...prev,
        invoiceNumber: `${company.invoicePrefix || 'INV'}-${year}-${month}-${randomNum}`,
        dueDate: dueDate.toISOString().split('T')[0],
        terms: company.terms || 'Payment due within 30 days',
      }));
    }
  }, [id, getInvoice, navigate, company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (newItems) => {
    setInvoice(prev => {
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
    setInvoice(prev => ({
      ...prev,
      discount,
      total: prev.subtotal + prev.taxTotal - discount,
    }));
  };

  const validateForm = () => {
    if (!invoice.customerName?.trim()) {
      showError('Please enter customer name');
      return false;
    }
    if (!invoice.invoiceNumber?.trim()) {
      showError('Please enter invoice number');
      return false;
    }
    if (!invoice.date) {
      showError('Please select invoice date');
      return false;
    }
    if (!invoice.dueDate) {
      showError('Please select due date');
      return false;
    }
    if (invoice.items.length === 0) {
      showError('Please add at least one item');
      return false;
    }
    const invalidItems = invoice.items.filter(item => !item.description?.trim());
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
        ...invoice,
        company: { ...company },
      };

      if (id) {
        updateInvoice(parseInt(id), toSave);
        showSuccess('Invoice updated successfully!');
      } else {
        addInvoice(toSave);
        showSuccess('Invoice created successfully!');
      }
      
      setTimeout(() => navigate('/invoices'), 1500);
    } catch (error) {
      showError('Error saving invoice!');
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...invoice, company }, 'invoice');
      showSuccess('PDF downloaded successfully!');
    } catch (error) {
      showError('Error generating PDF!');
    }
  };

  const handleSendEmail = () => {
    // Implement email sending logic here
    showSuccess('Email sent successfully!');
  };

  const totals = {
    subtotal: invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0),
    taxTotal: invoice.items.reduce(
      (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100, 0
    ),
  };
  totals.total = totals.subtotal + totals.taxTotal - (invoice.discount || 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" color="primary">
              {id ? 'Edit Invoice' : 'New Invoice'}
            </Typography>
            {invoice.invoiceNumber && (
              <Chip label={`#: ${invoice.invoiceNumber}`} color="primary" sx={{ mt: 1 }} />
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
              fullWidth label="Invoice Number" name="invoiceNumber"
              value={invoice.invoiceNumber} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth type="date" label="Invoice Date" name="date"
              value={invoice.date} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth type="date" label="Due Date" name="dueDate"
              value={invoice.dueDate} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Customer Name" name="customerName"
              value={invoice.customerName} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Customer Email" name="customerEmail"
              value={invoice.customerEmail} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Customer Phone" name="customerPhone"
              value={invoice.customerPhone} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Customer Address" name="customerAddress"
              multiline rows={2} value={invoice.customerAddress} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Customer GST" name="customerGST"
              value={invoice.customerGST} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2 }}>Invoice Items</Typography>
            <ItemTable items={invoice.items} onItemsChange={handleItemsChange} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Discount" name="discount" type="number"
              value={invoice.discount} onChange={handleDiscountChange}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>{company.currency}</Typography> }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Notes" name="notes" multiline rows={3}
              value={invoice.notes} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle2">Subtotal: {company.currency}{totals.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle2">Tax Total: {company.currency}{totals.taxTotal.toFixed(2)}</Typography>
              {invoice.discount > 0 && (
                <Typography color="error">Discount: -{company.currency}{invoice.discount.toFixed(2)}</Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{totals.total.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth label="Terms & Conditions" name="terms" multiline rows={2}
              value={invoice.terms} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={invoice.status} onChange={handleInputChange} label="Status">
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            {company.footer || 'Thank you for your business!'}
          </Typography>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default InvoiceForm;