import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Button, // Added missing Button
} from '@mui/material';
import {
  Receipt,
  RequestQuote,
  Assignment,
  LocalShipping,
  Description,
  TrendingUp,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom'; // Added missing useNavigate
import { useInvoices } from '../../context/InvoiceContext';
import { useQuotations } from '../../context/QuotationContext';
import { useProjectOrders } from '../../context/ProjectOrderContext';
import { useEChallans } from '../../context/EChallanContext';
import { useProformas } from '../../context/ProformaContext';
import { useCompany } from '../../context/CompanyContext';

const Dashboard = () => {
  const navigate = useNavigate(); // Added missing navigate
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { quotations, loading: quotationsLoading } = useQuotations();
  const { projectOrders, loading: projectsLoading } = useProjectOrders();
  const { challans, loading: challansLoading } = useEChallans();
  const { proformas, loading: proformasLoading } = useProformas();
  const { company } = useCompany();
  
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Calculate monthly data from actual invoices
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() === date.getMonth() && 
               invDate.getFullYear() === date.getFullYear();
      });
      
      const monthQuotations = quotations.filter(q => {
        const qDate = new Date(q.date);
        return qDate.getMonth() === date.getMonth() && 
               qDate.getFullYear() === date.getFullYear();
      });
      
      last6Months.push({
        month: monthName,
        invoices: monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
        quotations: monthQuotations.reduce((sum, q) => sum + (q.total || 0), 0),
      });
    }
    
    setMonthlyData(last6Months);

    // Combine recent activity from all documents
    const allActivities = [
      ...invoices.map(doc => ({
        id: `inv-${doc.id}`,
        type: 'Invoice',
        number: doc.invoiceNumber,
        customer: doc.customerName,
        amount: doc.total,
        date: doc.createdAt || doc.date,
        status: doc.status,
      })),
      ...quotations.map(doc => ({
        id: `quo-${doc.id}`,
        type: 'Quotation',
        number: doc.quotationNumber,
        customer: doc.customerName,
        amount: doc.total,
        date: doc.createdAt || doc.date,
        status: doc.status,
      })),
      ...projectOrders.map(doc => ({
        id: `proj-${doc.id}`,
        type: 'Project Order',
        number: doc.orderNumber,
        customer: doc.customerName,
        amount: doc.total,
        date: doc.createdAt || doc.date,
        status: doc.status,
      })),
      ...challans.map(doc => ({
        id: `chal-${doc.id}`,
        type: 'E-Challan',
        number: doc.challanNumber,
        customer: doc.customerName,
        amount: doc.total,
        date: doc.createdAt || doc.date,
        status: doc.status,
      })),
      ...proformas.map(doc => ({
        id: `prof-${doc.id}`,
        type: 'Proforma',
        number: doc.proformaNumber,
        customer: doc.customerName,
        amount: doc.total,
        date: doc.createdAt || doc.date,
        status: doc.status,
      })),
    ];

    // Sort by date (most recent first) and take top 10
    const sorted = allActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    setRecentActivity(sorted);
  }, [invoices, quotations, projectOrders, challans, proformas]);

  const calculateStats = () => {
    const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidInvoices = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const totalQuotations = quotations.reduce((sum, q) => sum + (q.total || 0), 0);
    const acceptedQuotations = quotations
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (q.total || 0), 0);
    
    return {
      invoices: {
        total: totalInvoices,
        count: invoices.length,
        paid: paidInvoices,
        pending: invoices.filter(inv => inv.status === 'sent' || inv.status === 'pending').length,
      },
      quotations: {
        total: totalQuotations,
        count: quotations.length,
        accepted: acceptedQuotations,
        pending: quotations.filter(q => q.status === 'sent' || q.status === 'pending').length,
      },
      projects: {
        total: projectOrders.length,
        active: projectOrders.filter(p => p.status === 'in-progress' || p.status === 'approved').length,
        completed: projectOrders.filter(p => p.status === 'completed').length,
      },
      challans: {
        total: challans.length,
        delivered: challans.filter(c => c.status === 'delivered').length,
        pending: challans.filter(c => c.status === 'pending' || c.status === 'in-transit').length,
      },
      proformas: {
        total: proformas.reduce((sum, p) => sum + (p.total || 0), 0),
        count: proformas.length,
        converted: proformas.filter(p => p.status === 'converted').length,
        pending: proformas.filter(p => p.status === 'sent' || p.status === 'draft').length,
      },
    };
  };

  const stats = calculateStats();

  const isLoading = invoicesLoading || quotationsLoading || projectsLoading || 
                    challansLoading || proformasLoading;

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {(!invoices.length && !quotations.length && !projectOrders.length && 
        !challans.length && !proformas.length) ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Welcome to Business Documents Manager
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Get started by creating your first document
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button variant="contained" onClick={() => navigate('/invoices/new')}>
                Create Invoice
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => navigate('/quotations/new')}>
                Create Quotation
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Invoices"
              value={`${company?.currency || '₹'} ${stats.invoices.total.toLocaleString()}`}
              icon={<Receipt sx={{ color: 'white' }} />}
              color="#1976d2"
              subtitle={`${stats.invoices.count} invoices • ${stats.invoices.pending} pending`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Quotations"
              value={`${company?.currency || '₹'} ${stats.quotations.total.toLocaleString()}`}
              icon={<RequestQuote sx={{ color: 'white' }} />}
              color="#2e7d32"
              subtitle={`${stats.quotations.count} quotations • ${stats.quotations.pending} pending`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Project Orders"
              value={stats.projects.total.toString()}
              icon={<Assignment sx={{ color: 'white' }} />}
              color="#ed6c02"
              subtitle={`${stats.projects.active} active • ${stats.projects.completed} completed`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="E-Challans"
              value={stats.challans.total.toString()}
              icon={<LocalShipping sx={{ color: 'white' }} />}
              color="#9c27b0"
              subtitle={`${stats.challans.delivered} delivered • ${stats.challans.pending} pending`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Proforma Invoices"
              value={`${company?.currency || '₹'} ${stats.proformas.total.toLocaleString()}`}
              icon={<Description sx={{ color: 'white' }} />}
              color="#d32f2f"
              subtitle={`${stats.proformas.count} proformas • ${stats.proformas.pending} pending`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Monthly Growth"
              value={monthlyData.length > 1 ? 
                `${((monthlyData[monthlyData.length-1].invoices - monthlyData[0].invoices) / 
                  (monthlyData[0].invoices || 1) * 100).toFixed(1)}%` : '0%'
              }
              icon={<TrendingUp sx={{ color: 'white' }} />}
              color="#0288d1"
              subtitle="vs last 6 months"
            />
          </Grid>

          {/* Chart */}
          {monthlyData.some(m => m.invoices > 0 || m.quotations > 0) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="invoices" fill="#1976d2" name="Invoices" />
                    <Bar dataKey="quotations" fill="#2e7d32" name="Quotations" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box>
                  {recentActivity.map((activity) => (
                    <Box
                      key={activity.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <Box>
                        <Typography variant="body1">
                          {activity.type} #{activity.number} - {activity.customer}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(activity.date).toLocaleDateString()} • {activity.status}
                        </Typography>
                      </Box>
                      {activity.amount > 0 && (
                        <Typography variant="body2" color="primary">
                          {company?.currency || '₹'} {activity.amount.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;