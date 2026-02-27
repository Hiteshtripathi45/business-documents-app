import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CompanyProvider } from './context/CompanyContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { QuotationProvider } from './context/QuotationContext';
import { ProjectOrderProvider } from './context/ProjectOrderContext';
import { EChallanProvider } from './context/EChallanContext';
import { ProformaProvider } from './context/ProformaContext';
import Layout from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './pages/Settings';

// Invoice Components
import InvoiceForm from './components/Documents/Invoice/InvoiceForm';
import InvoiceList from './components/Documents/Invoice/InvoiceList';
import InvoicePreview from './components/Documents/Invoice/InvoicePreview';

// Quotation Components
import QuotationForm from './components/Documents/Quotation/QuotationForm';
import QuotationList from './components/Documents/Quotation/QuotationList';
import QuotationPreview from './components/Documents/Quotation/QuotationPreview';

// Project Order Components
import ProjectOrderForm from './components/Documents/ProjectOrder/ProjectOrderForm';
import ProjectOrderList from './components/Documents/ProjectOrder/ProjectOrderList';
import ProjectOrderPreview from './components/Documents/ProjectOrder/ProjectOrderPreview';

// E-Challan Components
import EChallanForm from './components/Documents/EChallan/EChallanForm';
import EChallanList from './components/Documents/EChallan/EChallanList';
import EChallanPreview from './components/Documents/EChallan/EChallanPreview';

// Proforma Invoice Components
import ProformaInvoiceForm from './components/Documents/ProformaInvoice/ProformaInvoiceForm';
import ProformaInvoiceList from './components/Documents/ProformaInvoice/ProformaInvoiceList';
import ProformaInvoicePreview from './components/Documents/ProformaInvoice/ProformaInvoicePreview';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CompanyProvider>
        <InvoiceProvider>
          <QuotationProvider>
            <ProjectOrderProvider>
              <EChallanProvider>
                <ProformaProvider>
                  <Router>
                    <Layout />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Invoice Routes */}
                      <Route path="/invoices" element={<InvoiceList />} />
                      <Route path="/invoices/new" element={<InvoiceForm />} />
                      <Route path="/invoices/edit/:id" element={<InvoiceForm />} />
                      <Route path="/invoices/:id" element={<InvoicePreview />} />
                      
                      {/* Quotation Routes */}
                      <Route path="/quotations" element={<QuotationList />} />
                      <Route path="/quotations/new" element={<QuotationForm />} />
                      <Route path="/quotations/edit/:id" element={<QuotationForm />} />
                      <Route path="/quotations/:id" element={<QuotationPreview />} />
                      
                      {/* Project Order Routes */}
                      <Route path="/project-orders" element={<ProjectOrderList />} />
                      <Route path="/project-orders/new" element={<ProjectOrderForm />} />
                      <Route path="/project-orders/edit/:id" element={<ProjectOrderForm />} />
                      <Route path="/project-orders/:id" element={<ProjectOrderPreview />} />
                      
                      {/* E-Challan Routes */}
                      <Route path="/e-challans" element={<EChallanList />} />
                      <Route path="/e-challans/new" element={<EChallanForm />} />
                      <Route path="/e-challans/edit/:id" element={<EChallanForm />} />
                      <Route path="/e-challans/:id" element={<EChallanPreview />} />
                      
                      {/* Proforma Invoice Routes */}
                      <Route path="/proforma-invoices" element={<ProformaInvoiceList />} />
                      <Route path="/proforma-invoices/new" element={<ProformaInvoiceForm />} />
                      <Route path="/proforma-invoices/edit/:id" element={<ProformaInvoiceForm />} />
                      <Route path="/proforma-invoices/:id" element={<ProformaInvoicePreview />} />
                      
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Router>
                </ProformaProvider>
              </EChallanProvider>
            </ProjectOrderProvider>
          </QuotationProvider>
        </InvoiceProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}

export default App;