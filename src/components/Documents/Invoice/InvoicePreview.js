import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Print,
  PictureAsPdf,
  Edit,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../../../context/InvoiceContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoice } = useInvoices();
  const { company } = useCompany();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const data = getInvoice(parseInt(id));
    if (data) {
      setInvoice(data);
    } else {
      navigate('/invoices');
    }
  }, [id, getInvoice, navigate]);

  if (!invoice) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    generatePDF({ ...invoice, company }, 'invoice');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }} className="print-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/invoices')}>
            Back
          </Button>
          <Box>
            <IconButton onClick={handlePrint} color="primary"><Print /></IconButton>
            <IconButton onClick={handleDownloadPDF} color="primary"><PictureAsPdf /></IconButton>
            <IconButton onClick={() => navigate(`/invoices/edit/${id}`)} color="primary"><Edit /></IconButton>
          </Box>
        </Box>

        <Typography variant="h4" color="primary" align="center" gutterBottom>
          TAX INVOICE
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">{company.name}</Typography>
            <Typography variant="body2">{company.address}</Typography>
            <Typography variant="body2">Phone: {company.phone}</Typography>
            <Typography variant="body2">Email: {company.email}</Typography>
            <Typography variant="body2">GST: {company.gst}</Typography>
            <Typography variant="body2">PAN: {company.pan}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">#{invoice.invoiceNumber}</Typography>
              <Typography>Invoice Date: {invoice.date}</Typography>
              <Typography>Due Date: {invoice.dueDate}</Typography>
              <Chip label={invoice.status?.toUpperCase()} color={getStatusColor(invoice.status)} sx={{ mt: 1 }} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Bill To:</Typography>
            <Typography variant="h6">{invoice.customerName}</Typography>
            <Typography>{invoice.customerAddress}</Typography>
            <Typography>Email: {invoice.customerEmail}</Typography>
            <Typography>Phone: {invoice.customerPhone}</Typography>
            <Typography>GST: {invoice.customerGST}</Typography>
          </Grid>

          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>#</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Tax %</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{company.currency}{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.tax}%</TableCell>
                      <TableCell align="right">{company.currency}{item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            {invoice.notes && (
              <>
                <Typography variant="subtitle2">Notes:</Typography>
                <Typography variant="body2">{invoice.notes}</Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1">Subtotal: {company.currency}{invoice.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle1">Tax Total: {company.currency}{invoice.taxTotal.toFixed(2)}</Typography>
              {invoice.discount > 0 && (
                <Typography color="error">Discount: -{company.currency}{invoice.discount.toFixed(2)}</Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{invoice.total.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Terms & Conditions:</Typography>
            <Typography variant="body2">{invoice.terms}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary" align="center" display="block">
              {company.footer || 'Thank you for your business!'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default InvoicePreview;