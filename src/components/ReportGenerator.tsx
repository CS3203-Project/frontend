import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Filter,
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import Button from './Button';
import { type ReportParams, type ReportData } from '../api/adminApi';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { mockReports, simulateApiDelay } from '../data/mockReportData';
import { downloadFile, generateCSV, formatReportDate, formatCurrency } from '../utils/reportUtils';

interface ReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState<ReportParams['type']>('analytics');
  const [format, setFormat] = useState<ReportParams['format']>('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    location: ''
  });

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Fetch reports history
  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchReports();
    }
  }, [isOpen, activeTab]);

  const fetchReports = async () => {
    try {
      // Using mock data for demonstration
      await simulateApiDelay(500);
      setReports(mockReports);
      
      // Uncomment below for real API call
      // const response = await adminApi.getReports();
      // setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showErrorToast('Failed to fetch reports history');
    }
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      showErrorToast('Please select both start and end dates');
      return;
    }

    setIsGenerating(true);
    try {
      // For future API integration, you would use these params:
      // const params: ReportParams = {
      //   type: reportType,
      //   startDate,
      //   endDate,
      //   format,
      //   filters: Object.fromEntries(
      //     Object.entries(filters).filter(([, value]) => value !== '')
      //   )
      // };

      // Using mock data for demonstration
      await simulateApiDelay(2000);
      
      // Simulate adding a new report to the list
      const newReport: ReportData = {
        id: Date.now().toString(),
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}.${format}`,
        type: reportType,
        generatedAt: new Date().toISOString(),
        downloadUrl: `/reports/${reportType}-${Date.now()}.${format}`,
        status: 'completed',
        fileSize: '1.2 MB'
      };
      
      setReports(prev => [newReport, ...prev]);
      
      // Uncomment below for real API call
      // await adminApi.generateReport(params);
      
      showSuccessToast('Report generated successfully');
      
      // Switch to history tab to show the new report
      setActiveTab('history');
    } catch (error) {
      console.error('Error generating report:', error);
      showErrorToast('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string, fileName: string) => {
    try {
      // For demonstration, generate mock file content based on report type
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Simulate API delay
      await simulateApiDelay(1000);

      let content: string;
      let mimeType: string;

      // Generate different content based on report type
      switch (report.type) {
        case 'analytics':
          content = generateCSV(
            [
              { metric: 'Total Users', value: 15847 },
              { metric: 'Total Providers', value: 2456 },
              { metric: 'Total Services', value: 8932 },
              { metric: 'Revenue', value: formatCurrency(1247856) }
            ],
            ['metric', 'value']
          );
          mimeType = 'text/csv';
          break;
        case 'users':
          content = generateCSV(
            [
              { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: formatReportDate(new Date()) },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: formatReportDate(new Date()) }
            ],
            ['id', 'name', 'email', 'joinDate']
          );
          mimeType = 'text/csv';
          break;
        default:
          content = `${report.type.toUpperCase()} REPORT\n\nGenerated on: ${formatReportDate(new Date())}\n\nThis is a mock report for demonstration purposes.`;
          mimeType = 'text/plain';
      }

      downloadFile(content, fileName, mimeType);
      showSuccessToast('Report downloaded successfully');

      // For real implementation, use:
      // const blob = await adminApi.downloadReport(reportId);
      // downloadFile(blob, fileName);
    } catch (error) {
      console.error('Error downloading report:', error);
      showErrorToast('Failed to download report');
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'users': return <Users className="w-5 h-5" />;
      case 'services': return <ShoppingBag className="w-5 h-5" />;
      case 'providers': return <Users className="w-5 h-5" />;
      case 'transactions': return <DollarSign className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Generator</h2>
              <p className="text-gray-600">Generate comprehensive reports and analytics</p>
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
        <div className="flex border-b border-gray-200 bg-gray-50">
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
                    onChange={(e) => setReportType(e.target.value as ReportParams['type'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="analytics">Analytics Overview</option>
                    <option value="users">User Report</option>
                    <option value="providers">Provider Report</option>
                    <option value="services">Service Report</option>
                    <option value="transactions">Transaction Report</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ReportParams['format'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Advanced Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      <option value="home-services">Home Services</option>
                      <option value="automotive">Automotive</option>
                      <option value="beauty">Beauty & Wellness</option>
                      <option value="education">Education</option>
                      <option value="technology">Technology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
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
                      Generate Report
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
                  onClick={fetchReports}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reports generated yet</p>
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
                              Generated on {new Date(report.generatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {getStatusIcon(report.status)}
                            <span className="ml-1 text-sm font-medium capitalize">
                              {report.status}
                            </span>
                          </div>
                          {report.status === 'completed' && (
                            <Button
                              onClick={() => handleDownloadReport(report.id, report.name)}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                      {report.fileSize && (
                        <p className="text-xs text-gray-400 mt-2">File size: {report.fileSize}</p>
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
