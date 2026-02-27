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
  LocalShipping,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEChallans } from '../../../context/EChallanContext';
import { useCompany } from '../../../context/CompanyContext';
import { generatePDF } from '../../../utils/pdfGenerator';

const EChallanList = () => {
  const navigate = useNavigate();
  const { challans, loading, deleteChallan } = useEChallans();
  const { company } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in-transit': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleMenuOpen = (event, challan) => {
    setAnchorEl(event.currentTarget);
    setSelectedChallan(challan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChallan(null);
  };

  const handleEdit = () => {
    navigate(`/e-challans/edit/${selectedChallan.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    try {
      deleteChallan(selectedChallan.id);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'E-Challan deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting e-challan', severity: 'error' });
    }
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/e-challans/${selectedChallan.id}`);
    handleMenuClose();
  };

  const handlePrint = () => {
    window.open(`/e-challans/${selectedChallan.id}`, '_blank');
    handleMenuClose();
  };

  const handleDownloadPDF = () => {
    try {
      generatePDF({ ...selectedChallan, company }, 'challan');
      setSnackbar({ open: true, message: 'PDF downloaded', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error generating PDF', severity: 'error' });
    }
    handleMenuClose();
  };

  const filteredChallans = challans.filter(c => 
    c.challanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h4">E-Challans</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/e-challans/new')}
        >
          New E-Challan
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by challan number, customer or vehicle..."
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

      {filteredChallans.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LocalShipping sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No E-Challans
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create your first e-challan to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/e-challans/new')}
          >
            Create E-Challan
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Challan #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>From → To</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChallans.map((challan) => (
                <TableRow key={challan.id}>
                  <TableCell>{challan.challanNumber}</TableCell>
                  <TableCell>{challan.date}</TableCell>
                  <TableCell>{challan.customerName}</TableCell>
                  <TableCell>{challan.vehicleNumber}</TableCell>
                  <TableCell>{`${challan.fromLocation} → ${challan.toLocation}`}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={challan.status?.toUpperCase()}
                      color={getStatusColor(challan.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, challan)} size="small">
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
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete E-Challan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete challan {selectedChallan?.challanNumber}? This cannot be undone.
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

export default EChallanList;