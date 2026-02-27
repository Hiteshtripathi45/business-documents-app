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
import { Save, Print, PictureAsPdf } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectOrders } from '../../../context/ProjectOrderContext';
import { useCompany } from '../../../context/CompanyContext';
import ItemTable from '../../Common/ItemTable';
import CompanyInfo from '../../Common/CompanyInfo';
import { generatePDF } from '../../../utils/pdfGenerator';

const ProjectOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProjectOrder, updateProjectOrder, getProjectOrder } = useProjectOrders();
  const { company } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [order, setOrder] = useState({
    orderNumber: '',
    date: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    projectName: '',
    projectType: 'development',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    subtotal: 0,
    taxTotal: 0,
    total: 0,
    advance: 0,
    balance: 0,
    projectManager: '',
    teamMembers: [],
    notes: '',
    terms: '',
    status: 'draft',
    priority: 'medium',
    company: { ...company },
  });

  useEffect(() => {
    setOrder(prev => ({
      ...prev,
      company: { ...company },
    }));
  }, [company]);

  useEffect(() => {
    if (id) {
      const existing = getProjectOrder(parseInt(id));
      if (existing) {
        setOrder({
          ...existing,
          company: { ...company },
        });
      } else {
        navigate('/project-orders');
      }
    } else {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      
      setOrder(prev => ({
        ...prev,
        orderNumber: `${company.projectPrefix || 'PO'}-${year}-${month}-${randomNum}`,
        terms: company.terms || '',
      }));
    }
  }, [id, getProjectOrder, navigate, company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (newItems) => {
    setOrder(prev => {
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxTotal = newItems.reduce(
        (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100,
        0
      );
      const total = subtotal + taxTotal;
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

  const handleAdvanceChange = (e) => {
    const advance = parseFloat(e.target.value) || 0;
    setOrder(prev => ({
      ...prev,
      advance,
      balance: Math.max(0, prev.total - advance),
    }));
  };

  const handleTeamMembersChange = (e) => {
    const members = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    setOrder(prev => ({ ...prev, teamMembers: members }));
  };

  const validateForm = () => {
    if (!order.customerName?.trim()) {
      showError('Please enter customer name');
      return false;
    }
    if (!order.projectName?.trim()) {
      showError('Please enter project name');
      return false;
    }
    if (!order.orderNumber?.trim()) {
      showError('Please enter order number');
      return false;
    }
    if (!order.date) {
      showError('Please select date');
      return false;
    }
    if (!order.startDate) {
      showError('Please select start date');
      return false;
    }
    if (!order.endDate) {
      showError('Please select end date');
      return false;
    }
    if (!order.projectManager?.trim()) {
      showError('Please enter project manager');
      return false;
    }
    if (order.items.length === 0) {
      showError('Please add at least one item');
      return false;
    }
    const invalidItems = order.items.filter(item => !item.description?.trim());
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
        ...order,
        company: { ...company },
      };

      if (id) {
        updateProjectOrder(parseInt(id), toSave);
        showSuccess('Project order updated successfully!');
      } else {
        addProjectOrder(toSave);
        showSuccess('Project order created successfully!');
      }
      
      setTimeout(() => navigate('/project-orders'), 1500);
    } catch (error) {
      showError('Error saving project order!');
    }
  };

  const handlePrint = () => window.print();
  
  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...order, company }, 'project');
      showSuccess('PDF downloaded successfully!');
    } catch (error) {
      showError('Error generating PDF!');
    }
  };

  const totals = {
    subtotal: order.items.reduce((sum, item) => sum + (item.amount || 0), 0),
    taxTotal: order.items.reduce(
      (sum, item) => sum + ((item.amount || 0) * (item.tax || 0)) / 100, 0
    ),
  };
  totals.total = totals.subtotal + totals.taxTotal;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" color="primary">
              {id ? 'Edit Project Order' : 'New Project Order'}
            </Typography>
            {order.orderNumber && (
              <Chip label={`#: ${order.orderNumber}`} color="primary" sx={{ mt: 1 }} />
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
              fullWidth label="Order Number" name="orderNumber"
              value={order.orderNumber} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth type="date" label="Order Date" name="date"
              value={order.date} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth type="date" label="Start Date" name="startDate"
              value={order.startDate} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth type="date" label="End Date" name="endDate"
              value={order.endDate} onChange={handleInputChange}
              InputLabelProps={{ shrink: true }} required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Project Name" name="projectName"
              value={order.projectName} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Project Type</InputLabel>
              <Select name="projectType" value={order.projectType} onChange={handleInputChange} label="Project Type">
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="design">Design</MenuItem>
                <MenuItem value="consulting">Consulting</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="training">Training</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={order.priority} onChange={handleInputChange} label="Priority">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Customer Name" name="customerName"
              value={order.customerName} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Email" name="customerEmail"
              value={order.customerEmail} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Phone" name="customerPhone"
              value={order.customerPhone} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Address" name="customerAddress"
              multiline rows={2} value={order.customerAddress} onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Project Manager" name="projectManager"
              value={order.projectManager} onChange={handleInputChange} required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Team Members (comma separated)" 
              value={order.teamMembers?.join(', ')} onChange={handleTeamMembersChange}
              placeholder="John Doe, Jane Smith, Bob Johnson"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2 }}>Project Items/Services</Typography>
            <ItemTable items={order.items} onItemsChange={handleItemsChange} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Advance Payment" name="advance" type="number"
              value={order.advance} onChange={handleAdvanceChange}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>{company.currency}</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth label="Balance" value={order.balance.toFixed(2)} disabled
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>{company.currency}</Typography> }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={order.status} onChange={handleInputChange} label="Status">
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending Approval</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Notes" name="notes" multiline rows={3}
              value={order.notes} onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle2">Subtotal: {company.currency}{totals.subtotal.toFixed(2)}</Typography>
              <Typography variant="subtitle2">Tax: {company.currency}{totals.taxTotal.toFixed(2)}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">Total: {company.currency}{totals.total.toFixed(2)}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth label="Terms" name="terms" multiline rows={2}
              value={order.terms} onChange={handleInputChange}
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

export default ProjectOrderForm;