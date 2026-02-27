import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  RequestQuote,
  Assignment,
  LocalShipping,
  Description,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const documents = [
    { title: 'Invoice', icon: <Receipt sx={{ fontSize: 40 }} />, path: '/invoices', color: '#1976d2' },
    { title: 'Quotation', icon: <RequestQuote sx={{ fontSize: 40 }} />, path: '/quotations', color: '#2e7d32' },
    { title: 'Project Order', icon: <Assignment sx={{ fontSize: 40 }} />, path: '/project-orders', color: '#ed6c02' },
    { title: 'E-Challan', icon: <LocalShipping sx={{ fontSize: 40 }} />, path: '/e-challans', color: '#9c27b0' },
    { title: 'Proforma Invoice', icon: <Description sx={{ fontSize: 40 }} />, path: '/proforma-invoices', color: '#d32f2f' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Business Documents Manager
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Create and manage all your business documents in one place
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Go to Dashboard
        </Button>
      </Box>

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.title}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: doc.color, mb: 2 }}>
                  {doc.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2">
                  {doc.title}
                </Typography>
                <Typography color="textSecondary">
                  Create, manage, and track {doc.title.toLowerCase()}s
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(doc.path)}
                  fullWidth
                >
                  View {doc.title}s
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;