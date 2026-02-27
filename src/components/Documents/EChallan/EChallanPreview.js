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
  LocalShipping,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEChallans } from '../../../context/EChallanContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const EChallanPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getChallan } = useEChallans();
  const { company } = useCompany();
  const [challan, setChallan] = useState(null);

  useEffect(() => {
    const data = getChallan(parseInt(id));
    if (data) {
      setChallan(data);
    } else {
      navigate('/e-challans');
    }
  }, [id, getChallan, navigate]);

  if (!challan) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in-transit': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    generatePDF({ ...challan, company }, 'challan');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }} className="print-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/e-challans')}>
            Back
          </Button>
          <Box>
            <IconButton onClick={handlePrint} color="primary"><Print /></IconButton>
            <IconButton onClick={handleDownloadPDF} color="primary"><PictureAsPdf /></IconButton>
            <IconButton onClick={() => navigate(`/e-challans/edit/${id}`)} color="primary"><Edit /></IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <LocalShipping sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" color="primary">E-CHALLAN</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">#{challan.challanNumber}</Typography>
            <Typography variant="body2">Date: {challan.date} | Time: {challan.time}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'right' }}>
              <Chip label={challan.status?.toUpperCase()} color={getStatusColor(challan.status)} />
              <Chip label={challan.type?.toUpperCase()} variant="outlined" sx={{ ml: 1 }} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">From:</Typography>
            <Typography variant="h6">{company.name}</Typography>
            <Typography variant="body2">{company.address}</Typography>
            <Typography variant="body2">Phone: {company.phone}</Typography>
            <Typography variant="body2">GST: {company.gst}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">To:</Typography>
            <Typography variant="h6">{challan.customerName}</Typography>
            <Typography variant="body2">{challan.customerAddress}</Typography>
            <Typography variant="body2">Phone: {challan.customerPhone}</Typography>
            <Typography variant="body2">GST: {challan.customerGST}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Transportation Details</Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Transporter</Typography>
            <Typography>{challan.transporterName}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Vehicle</Typography>
            <Typography>{challan.vehicleNumber}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Driver</Typography>
            <Typography>{challan.driverName}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Driver Phone</Typography>
            <Typography>{challan.driverPhone}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">From Location</Typography>
            <Typography>{challan.fromLocation}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">To Location</Typography>
            <Typography>{challan.toLocation}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Items</Typography>
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
                  {challan.items.map((item, index) => (
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

          <Grid item xs={12}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">Total Value: {company.currency}{challan.total.toFixed(2)}</Typography>
            </Box>
          </Grid>

          {challan.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">Notes:</Typography>
              <Typography variant="body2">{challan.notes}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Delivery Receipt</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Received By</Typography>
                <Typography>{challan.receivedBy || '___________'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Delivery Date</Typography>
                <Typography>{challan.deliveryDate || '___________'}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2">Authorized Signature</Typography>
                <Typography variant="body2" sx={{ mt: 4 }}>_____________________</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Receiver's Signature</Typography>
                <Typography variant="body2" sx={{ mt: 4 }}>_____________________</Typography>
              </Box>
            </Box>
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

export default EChallanPreview;