import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Users,
  ShoppingBag,
  BarChart3,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import Button from './Button';
import { adminApi, type Customer, type ServiceProvider, type Service } from '../api/adminApi';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import jsPDF from 'jspdf';

interface ReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 'customers' | 'providers' | 'services' | 'analytics';

interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  fileSize?: string;
  recordCount?: number;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState<ReportType>('customers');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [formErrors, setFormErrors] = useState<{ startDate?: string; endDate?: string }>({});

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Helper function to safely format text for PDF
  const formatText = (text: string | undefined | null): string => {
    if (!text) return 'N/A';
    return text.toString().replace(/[^\x20-\x7E]/g, '').substring(0, 50);
  };

  // Helper function to format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Generate PDF for customers
  const generateCustomersPDF = (customers: Customer[], fileName: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Customer Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Customers: ${customers.length}`, 20, 45);
    
    let yPosition = 65;
    doc.setFontSize(10);
    
    customers.forEach((customer, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${index + 1}. ${formatText(customer.firstName)} ${formatText(customer.lastName)}`, 20, yPosition);
      doc.text(`   Email: ${formatText(customer.email)}`, 20, yPosition + 7);
      doc.text(`   Phone: ${formatText(customer.phone)}`, 20, yPosition + 14);
      doc.text(`   Location: ${formatText(customer.location)}`, 20, yPosition + 21);
      doc.text(`   Status: ${customer.isActive ? 'Active' : 'Inactive'}`, 20, yPosition + 28);
      doc.text(`   Joined: ${formatDate(customer.createdAt)}`, 20, yPosition + 35);
      
      yPosition += 45;
    });
    
    doc.save(fileName);
  };

  // Generate PDF for providers
  const generateProvidersPDF = (providers: ServiceProvider[], fileName: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Service Providers Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Providers: ${providers.length}`, 20, 45);
    
    let yPosition = 65;
    doc.setFontSize(10);
    
    providers.forEach((provider, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${index + 1}. ${formatText(provider.user.firstName)} ${formatText(provider.user.lastName)}`, 20, yPosition);
      doc.text(`   Email: ${formatText(provider.user.email)}`, 20, yPosition + 7);
      doc.text(`   Phone: ${formatText(provider.user.phone)}`, 20, yPosition + 14);
      doc.text(`   Verified: ${provider.isVerified ? 'Yes' : 'No'}`, 20, yPosition + 21);
      doc.text(`   Services: ${provider._count?.services || 0}`, 20, yPosition + 28);
      doc.text(`   Joined: ${formatDate(provider.createdAt)}`, 20, yPosition + 35);
      
      yPosition += 45;
    });
    
    doc.save(fileName);
  };

  // Generate PDF for services
  const generateServicesPDF = (services: Service[], fileName: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Services Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Services: ${services.length}`, 20, 45);
    
    let yPosition = 65;
    doc.setFontSize(10);
    
    services.forEach((service, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${index + 1}. ${formatText(service.title)}`, 20, yPosition);
      doc.text(`   Provider: ${formatText(service.provider.user.firstName)} ${formatText(service.provider.user.lastName)}`, 20, yPosition + 7);
      doc.text(`   Category: ${formatText(service.category.name)}`, 20, yPosition + 14);
      doc.text(`   Price: ${formatText(service.currency)} ${formatText(service.price)}`, 20, yPosition + 21);
      doc.text(`   Status: ${service.isActive ? 'Active' : 'Inactive'}`, 20, yPosition + 28);
      doc.text(`   Created: ${formatDate(service.createdAt)}`, 20, yPosition + 35);
      
      yPosition += 45;
    });
    
    doc.save(fileName);
  };

  // Generate analytics PDF
  const generateAnalyticsPDF = (customers: Customer[], providers: ServiceProvider[], services: Service[], fileName: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Analytics Overview Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    
    let yPosition = 55;
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Total Customers: ${customers.length}`, 20, yPosition);
    doc.text(`Total Service Providers: ${providers.length}`, 20, yPosition + 10);
    doc.text(`Total Services: ${services.length}`, 20, yPosition + 20);
    doc.text(`Verified Providers: ${providers.filter(p => p.isVerified).length}`, 20, yPosition + 30);
    doc.text(`Active Services: ${services.filter(s => s.isActive).length}`, 20, yPosition + 40);
    doc.text(`Active Customers: ${customers.filter(c => c.isActive).length}`, 20, yPosition + 50);
    
    doc.save(fileName);
  };

  // Main report generation handler
  const handleGenerateReport = async () => {
    // Reset errors
    setFormErrors({});

    // Basic validation with inline feedback
    if (!startDate || !endDate) {
      const nextErrors: { startDate?: string; endDate?: string } = {};
      if (!startDate) nextErrors.startDate = 'Select a start date';
      if (!endDate) nextErrors.endDate = 'Select an end date';
      setFormErrors(nextErrors);
      showErrorToast('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      setFormErrors({ endDate: 'End date must be on or after the start date' });
      showErrorToast('Start date cannot be after end date');
      return;
    }

    setIsGenerating(true);
    
    try {
      let recordCount = 0;
      let reportTitle: string;
      
      switch (reportType) {
        case 'customers': {
          const response = await adminApi.getAllCustomers();
          if (!response.success) throw new Error('Failed to fetch customers data');
          recordCount = response.data.length;
          reportTitle = 'Customers Report';
          
          const fileName = `customers_report_${new Date().toISOString().split('T')[0]}.pdf`;
          generateCustomersPDF(response.data, fileName);
          break;
        }
        case 'providers': {
          const response = await adminApi.getAllServiceProviders();
          if (!response.success) throw new Error('Failed to fetch providers data');
          recordCount = response.data.length;
          reportTitle = 'Service Providers Report';
          
          const fileName = `providers_report_${new Date().toISOString().split('T')[0]}.pdf`;
          generateProvidersPDF(response.data, fileName);
          break;
        }
        case 'services': {
          const response = await adminApi.getAllServices();
          if (!response.success) throw new Error('Failed to fetch services data');
          recordCount = response.data.length;
          reportTitle = 'Services Report';
          
          const fileName = `services_report_${new Date().toISOString().split('T')[0]}.pdf`;
          generateServicesPDF(response.data, fileName);
          break;
        }
        case 'analytics': {
          const [customersResponse, providersResponse, servicesResponse] = await Promise.all([
            adminApi.getAllCustomers(),
            adminApi.getAllServiceProviders(),
            adminApi.getAllServices()
          ]);
          
          if (!customersResponse.success || !providersResponse.success || !servicesResponse.success) {
            throw new Error('Failed to fetch analytics data');
          }
          
          recordCount = customersResponse.data.length + providersResponse.data.length + servicesResponse.data.length;
          reportTitle = 'Analytics Overview Report';
          
          const fileName = `analytics_report_${new Date().toISOString().split('T')[0]}.pdf`;
          generateAnalyticsPDF(customersResponse.data, providersResponse.data, servicesResponse.data, fileName);
          break;
        }
        default:
          throw new Error('Invalid report type');
      }
      
      // Add to reports history
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        name: `${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`,
        type: reportType,
        generatedAt: new Date().toISOString(),
        status: 'completed',
        fileSize: 'Downloaded',
        recordCount
      };
      
      setReports(prev => [newReport, ...prev]);
      showSuccessToast(`${reportTitle} generated and downloaded successfully`);
      
      // Switch to history tab
      setActiveTab('history');
    } catch (error) {
      console.error('Error generating report:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'customers': return <Users className="w-5 h-5" />;
      case 'services': return <ShoppingBag className="w-5 h-5" />;
      case 'providers': return <Users className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Generator</h2>
              <p className="text-gray-600">Generate comprehensive reports and download as PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
  <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          {[
            { id: 'generate', label: 'Generate Report', icon: FileText },
            { id: 'history', label: 'Report History', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'generate' | 'history')}
              className={`flex items-center px-6 py-3 font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
  <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-gradient-to-br from-white via-white to-blue-50/30">
          {activeTab === 'generate' && (
            <div className="space-y-6">
              {/* Report Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600/40 bg-white text-gray-900"
                  >
                    <option value="customers">Customer Report</option>
                    <option value="providers">Service Provider Report</option>
                    <option value="services">Services Report</option>
                    <option value="analytics">Analytics Overview</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <select
                    value="pdf"
                    disabled
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-invalid={!!formErrors.startDate}
                    style={{ colorScheme: 'light' }}
                    className={`w-full px-3 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600/40 ${
                      formErrors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-invalid={!!formErrors.endDate}
                    style={{ colorScheme: 'light' }}
                    className={`w-full px-3 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600/40 ${
                      formErrors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Report Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Report Description</h3>
                <p className="text-blue-700 text-sm">
                  {reportType === 'customers' && 'Generate a comprehensive report of all customers including their contact information, status, and account details.'}
                  {reportType === 'providers' && 'Generate a detailed report of all service providers including verification status, services count, and ratings.'}
                  {reportType === 'services' && 'Generate a complete report of all services including provider information, categories, pricing, and status.'}
                  {reportType === 'analytics' && 'Generate an overview report with summary statistics, service categories breakdown, and key metrics.'}
                </p>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate & Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Report History</h3>
                <Button
                  onClick={() => setReports([])}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reports generated yet</p>
                  <p className="text-gray-400 text-sm mt-2">Generate your first report to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getReportTypeIcon(report.type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{report.name}</h4>
                            <p className="text-sm text-gray-500">
                              Generated on {new Date(report.generatedAt).toLocaleDateString()} • {report.recordCount} records
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {getStatusIcon(report.status)}
                            <span className="ml-1 text-sm font-medium capitalize text-green-600">
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      {report.fileSize && (
                        <p className="text-xs text-gray-400 mt-2">Status: {report.fileSize}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;