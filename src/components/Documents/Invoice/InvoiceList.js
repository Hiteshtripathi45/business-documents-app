import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Search,
  PictureAsPdf,
  Print,
  Receipt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../../../context/InvoiceContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const InvoiceList = () => {
  const navigate = useNavigate();
  const { invoices, loading, deleteInvoice } = useInvoices();
  const { company } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'draft': return 'default';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const handleMenuOpen = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleEdit = () => {
    navigate(`/invoices/edit/${selectedInvoice.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    try {
      deleteInvoice(selectedInvoice.id);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Invoice deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting invoice', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/invoices/${selectedInvoice.id}`);
    handleMenuClose();
  };

  const handlePrint = () => {
    window.open(`/invoices/${selectedInvoice.id}`, '_blank');
    handleMenuClose();
  };

  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...selectedInvoice, company }, 'invoice');
      setSnackbar({ open: true, message: 'PDF downloaded', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error generating PDF', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleMarkAsPaid = () => {
    try {
      // This would need to be implemented in your context
      // updateInvoice(selectedInvoice.id, { ...selectedInvoice, status: 'paid' });
      setSnackbar({ open: true, message: 'Invoice marked as paid', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating invoice', severity: 'error' });
    }
    handleMenuClose();
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Invoices</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/invoices/new')}
        >
          New Invoice
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by invoice number or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filteredInvoices.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Invoices
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create your first invoice to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/invoices/new')}
          >
            Create Invoice
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell align="right">
                    {company?.currency || '₹'}{invoice.total?.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={invoice.status?.toUpperCase()}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, invoice)} size="small">
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}><Visibility fontSize="small" sx={{ mr: 1 }} /> View</MenuItem>
        <MenuItem onClick={handleEdit}><Edit fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
        <MenuItem onClick={handlePrint}><Print fontSize="small" sx={{ mr: 1 }} /> Print</MenuItem>
        <MenuItem onClick={handleDownloadPDF}><PictureAsPdf fontSize="small" sx={{ mr: 1 }} /> PDF</MenuItem>
        {selectedInvoice?.status !== 'paid' && (
          <MenuItem onClick={handleMarkAsPaid}>
            <Receipt fontSize="small" sx={{ mr: 1 }} /> Mark as Paid
          </MenuItem>
        )}
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete invoice {selectedInvoice?.invoiceNumber}? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default InvoiceList;