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
  RequestQuote, // Added missing import
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuotations } from '../../../context/QuotationContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const QuotationList = () => {
  const navigate = useNavigate();
  const { quotations, loading, deleteQuotation } = useQuotations();
  const { company } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const handleMenuOpen = (event, quotation) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuotation(quotation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuotation(null);
  };

  const handleEdit = () => {
    navigate(`/quotations/edit/${selectedQuotation.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    try {
      deleteQuotation(selectedQuotation.id);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Quotation deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting quotation', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/quotations/${selectedQuotation.id}`);
    handleMenuClose();
  };

  const handlePrint = () => {
    window.open(`/quotations/${selectedQuotation.id}`, '_blank');
    handleMenuClose();
  };

  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...selectedQuotation, company }, 'quotation');
      setSnackbar({ open: true, message: 'PDF downloaded', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error generating PDF', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleConvertToInvoice = () => {
    navigate('/invoices/new', { state: { quotation: selectedQuotation } });
    handleMenuClose();
  };

  const filteredQuotations = quotations.filter(q => 
    q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h4">Quotations</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/quotations/new')}
        >
          New Quotation
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by number or customer..."
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

      {filteredQuotations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <RequestQuote sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Quotations
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create your first quotation to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/quotations/new')}
          >
            Create Quotation
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quotation #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.quotationNumber}</TableCell>
                  <TableCell>{q.date}</TableCell>
                  <TableCell>{q.validUntil}</TableCell>
                  <TableCell>{q.customerName}</TableCell>
                  <TableCell align="right">
                    {company?.currency || '₹'}{q.total?.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={q.status?.toUpperCase()}
                      color={getStatusColor(q.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, q)} size="small">
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
        <MenuItem onClick={handleConvertToInvoice}><Receipt fontSize="small" sx={{ mr: 1 }} /> Convert to Invoice</MenuItem>
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Quotation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete {selectedQuotation?.quotationNumber}? This cannot be undone.
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

export default QuotationList;