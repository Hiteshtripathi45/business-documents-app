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
  Receipt,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuotations } from '../../../context/QuotationContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const QuotationPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQuotation } = useQuotations();
  const { company } = useCompany();
  const [quotation, setQuotation] = useState(null);

  useEffect(() => {
    const data = getQuotation(parseInt(id));
    if (data) {
      setQuotation(data);
    } else {
      navigate('/quotations');
    }
  }, [id, getQuotation, navigate]);

  if (!quotation) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'sent': return 'info';
      case 'draft': return 'default';
      case 'rejected': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    generatePDF({ ...quotation, company }, 'quotation');
  };

  const handleConvertToInvoice = () => {
    navigate('/invoices/new', { state: { quotation } });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }} className="print-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/quotations')}>
            Back
          </Button>
          <Box>
            <IconButton onClick={handlePrint} color="primary"><Print /></IconButton>
            <IconButton onClick={handleDownloadPDF} color="primary"><PictureAsPdf /></IconButton>
            <IconButton onClick={() => navigate(`/quotations/edit/${id}`)} color="primary"><Edit /></IconButton>
            <Button
              variant="contained" color="success" startIcon={<Receipt />}
              onClick={handleConvertToInvoice} sx={{ ml: 1 }}
            >
              Convert to Invoice
            </Button>
          </Box>
        </Box>

        <Typography variant="h4" color="primary" align="center" gutterBottom>
          QUOTATION
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
              <Typography variant="h6">#{quotation.quotationNumber}</Typography>
              <Typography>Date: {quotation.date}</Typography>
              <Typography>Valid Until: {quotation.validUntil}</Typography>
              <Chip label={quotation.status.toUpperCase()} color={getStatusColor(quotation.status)} sx={{ mt: 1 }} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Bill To:</Typography>
            <Typography variant="h6">{quotation.customerName}</Typography>
            <Typography>{quotation.customerAddress}</Typography>
            <Typography>Email: {quotation.customerEmail}</Typography>
            <Typography>Phone: {quotation.customerPhone}</Typography>
            <Typography>GST: {quotation.customerGST}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography>Payment Terms: {quotation.paymentTerms || 'N/A'}</Typography>
              <Typography>Delivery Terms: {quotation.deliveryTerms || 'N/A'}</Typography>
            </Box>
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
                  {quotation.items.map((item, index) => (
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
            {quotation.notes && (
              <>
                <Typography variant="subtitle2">Notes:</Typography>
                <Typography variant="body2">{quotation.notes}</Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1">Subtotal: {company.currency}{quotation.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle1">Tax Total: {company.currency}{quotation.taxTotal.toFixed(2)}</Typography>
              {quotation.discount > 0 && (
                <Typography color="error">Discount: -{company.currency}{quotation.discount.toFixed(2)}</Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{quotation.total.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Terms & Conditions:</Typography>
            <Typography variant="body2">{quotation.terms}</Typography>
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

export default QuotationPreview;