import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  Description,
  Assignment,
  LocalShipping,
  RequestQuote,
  Settings,
} from '@mui/icons-material';
import {useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Invoices', icon: <Receipt />, path: '/invoices' },
    { text: 'Quotations', icon: <RequestQuote />, path: '/quotations' },
    { text: 'Project Orders', icon: <Assignment />, path: '/project-orders' },
    { text: 'E-Challans', icon: <LocalShipping />, path: '/e-challans' },
    { text: 'Proforma Invoices', icon: <Description />, path: '/proforma-invoices' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Business Documents Manager
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;