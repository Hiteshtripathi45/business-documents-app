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
import { useProformas } from '../../../context/ProformaContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const ProformaInvoiceList = () => {
  const navigate = useNavigate();
  const { proformas, loading, deleteProforma } = useProformas();
  const { company } = useCompany(); // Fixed: was 'companyrack'
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const handleMenuOpen = (event, proforma) => {
    setAnchorEl(event.currentTarget);
    setSelectedProforma(proforma);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProforma(null);
  };

  const handleEdit = () => {
    navigate(`/proforma-invoices/edit/${selectedProforma.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    try {
      deleteProforma(selectedProforma.id);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Proforma deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting proforma', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/proforma-invoices/${selectedProforma.id}`);
    handleMenuClose();
  };

  const handlePrint = () => {
    window.open(`/proforma-invoices/${selectedProforma.id}`, '_blank');
    handleMenuClose();
  };

  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...selectedProforma, company }, 'proforma');
      setSnackbar({ open: true, message: 'PDF downloaded', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error generating PDF', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleConvertToInvoice = () => {
    navigate('/invoices/new', { state: { proforma: selectedProforma } });
    handleMenuClose();
  };

  const filteredProformas = proformas.filter(p => 
    p.proformaNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h4">Proforma Invoices</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/proforma-invoices/new')}
        >
          New Proforma
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

      {filteredProformas.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Proforma Invoices
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create your first proforma invoice to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/proforma-invoices/new')}
          >
            Create Proforma
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proforma #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProformas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.proformaNumber}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.customerName}</TableCell>
                  <TableCell align="right">
                    {company?.currency || '₹'}{p.total?.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={p.status?.toUpperCase()}
                      color={getStatusColor(p.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, p)} size="small">
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
        <MenuItem onClick={handleConvertToInvoice}><Receipt fontSize="small" sx={{ mr: 1 }} /> Convert</MenuItem>
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Proforma</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete {selectedProforma?.proformaNumber}? This cannot be undone.
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

export default ProformaInvoiceList;