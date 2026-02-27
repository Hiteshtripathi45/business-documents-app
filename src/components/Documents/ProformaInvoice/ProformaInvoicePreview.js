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
} from '@mui/material';
import {
  Print,
  PictureAsPdf,
  Edit,
  ArrowBack,
  Receipt,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useProformas } from '../../../context/ProformaContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const ProformaInvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProforma } = useProformas();
  const { company } = useCompany();
  const [proforma, setProforma] = useState(null);

  useEffect(() => {
    const data = getProforma(parseInt(id));
    if (data) {
      setProforma(data);
    } else {
      navigate('/proforma-invoices');
    }
  }, [id, getProforma, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'sent': return 'info';
      case 'draft': return 'default';
      case 'expired': return 'warning';
      case 'converted': return 'secondary';
      default: return 'default';
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    if (proforma) {
      generatePDF({ ...proforma, company }, 'proforma');
    }
  };

  const handleConvertToInvoice = () => {
    navigate('/invoices/new', { state: { proforma } });
  };

  if (!proforma) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }} className="print-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/proforma-invoices')}>
            Back
          </Button>
          <Box>
            <IconButton onClick={handlePrint} color="primary"><Print /></IconButton>
            <IconButton onClick={handleDownloadPDF} color="primary"><PictureAsPdf /></IconButton>
            <IconButton onClick={() => navigate(`/proforma-invoices/edit/${id}`)} color="primary"><Edit /></IconButton>
            <Button
              variant="contained" color="success" startIcon={<Receipt />}
              onClick={handleConvertToInvoice} sx={{ ml: 1 }}
            >
              Convert to Invoice
            </Button>
          </Box>
        </Box>

        <Typography variant="h4" color="primary" align="center" gutterBottom>
          PROFORMA INVOICE
        </Typography>
        <Typography variant="subtitle2" align="center" color="textSecondary" gutterBottom>
          (This is not a tax invoice)
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">{company.name}</Typography>
            <Typography variant="body2">{company.address}</Typography>
            <Typography variant="body2">Phone: {company.phone}</Typography>
            <Typography variant="body2">Email: {company.email}</Typography>
            <Typography variant="body2">GST: {company.gst}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">#{proforma.proformaNumber}</Typography>
              <Typography>Date: {proforma.date}</Typography>
              <Typography>Valid Until: {proforma.validUntil}</Typography>
              <Chip label={proforma.status.toUpperCase()} color={getStatusColor(proforma.status)} sx={{ mt: 1 }} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Bill To:</Typography>
            <Typography variant="h6">{proforma.customerName}</Typography>
            <Typography>{proforma.customerAddress}</Typography>
            <Typography>Email: {proforma.customerEmail}</Typography>
            <Typography>Phone: {proforma.customerPhone}</Typography>
            <Typography>GST: {proforma.customerGST}</Typography>
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
                  {proforma.items.map((item, index) => (
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
            <Typography variant="subtitle2">Payment Terms:</Typography>
            <Typography variant="body2">{proforma.paymentTerms}</Typography>
            {proforma.notes && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Notes:</Typography>
                <Typography variant="body2">{proforma.notes}</Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1">Subtotal: {company.currency}{proforma.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle1">Tax Total: {company.currency}{proforma.taxTotal.toFixed(2)}</Typography>
              {proforma.discount > 0 && (
                <Typography color="error">Discount: -{company.currency}{proforma.discount.toFixed(2)}</Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{proforma.total.toFixed(2)}</Typography>
              <Typography>Advance: {company.currency}{proforma.advance.toFixed(2)}</Typography>
              <Typography color="primary">Balance: {company.currency}{proforma.balance.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Terms & Conditions:</Typography>
            <Typography variant="body2">{proforma.terms}</Typography>
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

export default ProformaInvoicePreview;