import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (data, type) => {
  try {
    // Create new PDF document with A4 size
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Get company info from data
    const company = data.company || {
      name: 'Your Company Name',
      address: '123 Business Street, City, State - 123456',
      phone: '+91 1234567890',
      email: 'info@company.com',
      gst: '22AAAAA0000A1Z5',
      pan: 'AAAAA1234A',
      currency: '',
    };

    // Set document properties
    const docNumber = data.invoiceNumber || data.quotationNumber || data.challanNumber || data.orderNumber || data.proformaNumber || 'N/A';
    
    // Set document title based on type
    let titleText = '';
    switch(type) {
      case 'invoice':
        titleText = 'TAX INVOICE';
        break;
      case 'quotation':
        titleText = 'QUOTATION';
        break;
      case 'challan':
        titleText = 'E-CHALLAN';
        break;
      case 'project':
        titleText = 'PROJECT ORDER';
        break;
      case 'proforma':
        titleText = 'PROFORMA INVOICE';
        break;
      default:
        titleText = type.toUpperCase();
    }

    // ============ HEADER SECTION ============
    // Company Info (Left side)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text(company.name, 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(company.address, 20, 35);
    doc.text(`Phone: ${company.phone}`, 20, 42);
    doc.text(`Email: ${company.email}`, 20, 49);
    doc.text(`GST: ${company.gst}`, 20, 56);
    doc.text(`PAN: ${company.pan}`, 20, 63);

    // Document Title and Details (Right side)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text(titleText, 190, 25, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`#${docNumber}`, 190, 40, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Date: ${data.date || new Date().toLocaleDateString()}`, 190, 50, { align: 'right' });
    if (data.dueDate) {
      doc.text(`Due Date: ${data.dueDate}`, 190, 57, { align: 'right' });
    }

    // Status Chip
    if (data.status) {
      const status = data.status.toUpperCase();
      const statusColor = getStatusColor(data.status);
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(160, 64, 30, 6, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(status, 175, 69, { align: 'center' });
    }

    // ============ DIVIDER ============
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);

    // ============ BILL TO SECTION ============
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text('Bill To:', 20, 90);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(data.customerName || 'N/A', 20, 100);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Customer address
    const address = data.customerAddress || 'N/A';
    const addressLines = doc.splitTextToSize(address, 80);
    doc.text(addressLines, 20, 110);
    
    let contactY = 110 + (addressLines.length * 5);
    
    if (data.customerEmail) {
      doc.text(`Email: ${data.customerEmail}`, 20, contactY);
      contactY += 5;
    }
    if (data.customerPhone) {
      doc.text(`Phone: ${data.customerPhone}`, 20, contactY);
      contactY += 5;
    }
    if (data.customerGST) {
      doc.text(`GST: ${data.customerGST}`, 20, contactY);
    }

    // ============ ITEMS TABLE ============
    let finalY = contactY + 15;
    
    if (data.items && data.items.length > 0) {
      // Prepare table data with plain numbers (no symbols)
      const tableBody = data.items.map((item, index) => [
        (index + 1).toString(),
        item.description || 'N/A',
        item.quantity?.toString() || '0',
        (item.unitPrice || 0).toFixed(2),
        `${item.tax || 0}%`,
        (item.amount || 0).toFixed(2)
      ]);

      doc.autoTable({
        startY: finalY,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Tax %', 'Amount']],
        body: tableBody,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
          textColor: [50, 50, 50],
          overflow: 'linebreak',
          cellWidth: 'wrap',
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 9,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 70, halign: 'left' },
          2: { cellWidth: 20, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: 20, right: 20 },
      });

      finalY = doc.lastAutoTable.finalY + 15;
    }

    // ============ NOTES AND SUMMARY SECTION ============
    
    // Notes (Left side)
    if (data.notes && data.notes.trim() !== '') {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('Notes:', 20, finalY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitNotes = doc.splitTextToSize(data.notes, 80);
      doc.text(splitNotes, 20, finalY + 7);
      finalY += 10 + (splitNotes.length * 5);
    }

    // Summary (Right side)
    const subtotal = data.subtotal || 0;
    const taxTotal = data.taxTotal || 0;
    const total = data.total || 0;
    const discount = data.discount || 0;

    // Summary box with border
    const summaryX = 115;
    let summaryY = finalY;

    // Border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(summaryX, summaryY, 75, discount > 0 ? 55 : 45);

    let lineY = summaryY + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Subtotal (plain number)
    doc.text('Subtotal:', summaryX + 5, lineY);
    doc.text(subtotal.toFixed(2), summaryX + 70, lineY, { align: 'right' });
    
    // Tax (plain number)
    lineY += 7;
    doc.text('Tax Total:', summaryX + 5, lineY);
    doc.text(taxTotal.toFixed(2), summaryX + 70, lineY, { align: 'right' });
    
    // Discount if exists
    if (discount > 0) {
      lineY += 7;
      doc.setTextColor(211, 47, 47);
      doc.text('Discount:', summaryX + 5, lineY);
      doc.text(`-${discount.toFixed(2)}`, summaryX + 70, lineY, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }
    
    // Divider
    lineY += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(summaryX + 5, lineY, summaryX + 70, lineY);
    
    // Total with "rupees" text
    lineY += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Total:', summaryX + 5, lineY);
    doc.text(`${total.toFixed(2)} rupees`, summaryX + 70, lineY, { align: 'right' });

    // ============ TERMS AND CONDITIONS ============
    let termsY = finalY + (discount > 0 ? 70 : 60);
    
    if (data.terms && data.terms.trim() !== '') {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('Terms & Conditions:', 20, termsY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitTerms = doc.splitTextToSize(data.terms, 170);
      doc.text(splitTerms, 20, termsY + 7);
    }

    // ============ FOOTER ============
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        company.footer || 'Thank you for your business!',
        105,
        doc.internal.pageSize.height - 15,
        { align: 'center' }
      );
    }

    // ============ SAVE PDF ============
    const fileName = `${type}_${docNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
    return false;
  }
};

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'paid': return [76, 175, 80];
    case 'sent': return [33, 150, 243];
    case 'pending': return [255, 152, 0];
    case 'overdue': return [244, 67, 54];
    case 'draft': return [158, 158, 158];
    case 'accepted': return [76, 175, 80];
    case 'rejected': return [244, 67, 54];
    case 'expired': return [255, 152, 0];
    case 'delivered': return [76, 175, 80];
    case 'in-transit': return [33, 150, 243];
    case 'cancelled': return [158, 158, 158];
    case 'completed': return [76, 175, 80];
    case 'in-progress': return [33, 150, 243];
    case 'approved': return [76, 175, 80];
    default: return [158, 158, 158];
  }
};

// Helper functions for different document types
export const generateInvoicePDF = (invoice) => generatePDF(invoice, 'invoice');
export const generateQuotationPDF = (quotation) => generatePDF(quotation, 'quotation');
export const generateChallanPDF = (challan) => generatePDF(challan, 'challan');
export const generateProjectOrderPDF = (order) => generatePDF(order, 'project');
export const generateProformaPDF = (proforma) => generatePDF(proforma, 'proforma');