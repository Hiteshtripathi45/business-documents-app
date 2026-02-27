import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Box,
  Typography, // Add this missing import
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';

const ItemTable = ({ items, onItemsChange }) => {
  const handleAddItem = () => {
    onItemsChange([
      ...items,
      {
        id: Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Calculate amount
        updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        // Add tax calculation if needed
        return updatedItem;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Tax (%)</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(item.id, 'description', e.target.value)
                    }
                    placeholder="Item description"
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    size="small"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        'quantity',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 100 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    size="small"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        'unitPrice',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 100 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    size="small"
                    value={item.tax}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        'tax',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell align="right">
                  ₹{item.amount?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddItem}
        >
          Add Item
        </Button>
        <Typography variant="h6">
          Total: ₹{calculateTotal().toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
};

export default ItemTable;