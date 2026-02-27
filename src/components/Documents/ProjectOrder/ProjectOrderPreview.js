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
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Print,
  PictureAsPdf,
  Edit,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectOrders } from '../../../context/ProjectOrderContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const ProjectOrderPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectOrder } = useProjectOrders();
  const { company } = useCompany();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const data = getProjectOrder(parseInt(id));
    if (data) {
      setOrder(data);
    } else {
      navigate('/project-orders');
    }
  }, [id, getProjectOrder, navigate]);

  if (!order) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'approved': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    generatePDF({ ...order, company }, 'project');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }} className="print-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/project-orders')}>
            Back
          </Button>
          <Box>
            <IconButton onClick={handlePrint} color="primary"><Print /></IconButton>
            <IconButton onClick={handleDownloadPDF} color="primary"><PictureAsPdf /></IconButton>
            <IconButton onClick={() => navigate(`/project-orders/edit/${id}`)} color="primary"><Edit /></IconButton>
          </Box>
        </Box>

        <Typography variant="h4" color="primary" align="center" gutterBottom>
          PROJECT ORDER
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip label={order.status?.toUpperCase()} color={getStatusColor(order.status)} />
              <Chip label={`PRIORITY: ${order.priority?.toUpperCase()}`} color={getPriorityColor(order.priority)} />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">{company.name}</Typography>
            <Typography variant="body2">{company.address}</Typography>
            <Typography variant="body2">Phone: {company.phone}</Typography>
            <Typography variant="body2">Email: {company.email}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">#{order.orderNumber}</Typography>
              <Typography>Order Date: {order.date}</Typography>
              <Typography>Start Date: {order.startDate}</Typography>
              <Typography>End Date: {order.endDate}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Customer:</Typography>
            <Typography variant="h6">{order.customerName}</Typography>
            <Typography>{order.customerAddress}</Typography>
            <Typography>Email: {order.customerEmail}</Typography>
            <Typography>Phone: {order.customerPhone}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Project Details:</Typography>
            <Typography variant="h6">{order.projectName}</Typography>
            <Typography>Type: {order.projectType}</Typography>
            <Typography>Manager: {order.projectManager}</Typography>
            <Typography>Team: {order.teamMembers?.join(', ')}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2 }}>Items/Services</Typography>
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
                  {order.items.map((item, index) => (
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
            {order.notes && (
              <>
                <Typography variant="subtitle2">Notes:</Typography>
                <Typography variant="body2">{order.notes}</Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1">Subtotal: {company.currency}{order.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle1">Tax Total: {company.currency}{order.taxTotal.toFixed(2)}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{order.total.toFixed(2)}</Typography>
              <Typography>Advance: {company.currency}{order.advance.toFixed(2)}</Typography>
              <Typography color="primary">Balance: {company.currency}{order.balance.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2">Terms & Conditions:</Typography>
            <Typography variant="body2">{order.terms}</Typography>
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

export default ProjectOrderPreview;