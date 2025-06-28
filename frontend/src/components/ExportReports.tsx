import React, { useState } from 'react';
import { Download, FileText, BarChart3, Calendar, Filter, Settings } from 'lucide-react';

interface ExportReportsProps {
  trades: any[];
  performance: any;
}

interface ReportConfig {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  includeScreenshots: boolean;
  sections: {
    summary: boolean;
    trades: boolean;
    analytics: boolean;
    riskMetrics: boolean;
  };
}

export const ExportReports: React.FC<ExportReportsProps> = ({ trades, performance }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'reports'>('export');
  const [exportConfig, setExportConfig] = useState<ReportConfig>({
    format: 'csv',
    dateRange: {
      start: '',
      end: ''
    },
    includeCharts: true,
    includeScreenshots: false,
    sections: {
      summary: true,
      trades: true,
      analytics: true,
      riskMetrics: true
    }
  });

  const [reportType, setReportType] = useState<'performance' | 'risk' | 'custom'>('performance');

  const exportTrades = () => {
    const filteredTrades = trades.filter(trade => {
      if (exportConfig.dateRange.start && trade.date < exportConfig.dateRange.start) return false;
      if (exportConfig.dateRange.end && trade.date > exportConfig.dateRange.end) return false;
      return true;
    });

    if (exportConfig.format === 'csv') {
      exportToCSV(filteredTrades);
    } else if (exportConfig.format === 'excel') {
      exportToExcel(filteredTrades);
    } else {
      exportToPDF(filteredTrades);
    }
  };

  const exportToCSV = (trades: any[]) => {
    const headers = [
      'Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Size', 'P&L', 'P&L %',
      'Strategy', 'Notes', 'Stop Loss', 'Take Profit', 'Market Condition', 'Timeframe'
    ];

    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        trade.date,
        trade.symbol,
        trade.trade_type,
        trade.entry_price,
        trade.exit_price,
        trade.size,
        trade.profit_loss,
        trade.profit_loss_percentage,
        trade.strategy,
        trade.notes || '',
        trade.stop_loss || '',
        trade.take_profit || '',
        trade.market_condition || '',
        trade.timeframe || ''
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'trades.csv', 'text/csv');
  };

  const exportToExcel = (trades: any[]) => {
    // This would typically use a library like xlsx
    // For now, we'll create a CSV that Excel can open
    exportToCSV(trades);
  };

  const exportToPDF = (trades: any[]) => {
    // This would typically use a library like jsPDF or html2pdf
    // For now, we'll show a message
    alert('PDF export would be implemented with a PDF library');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const reportData = {
      type: reportType,
      dateRange: exportConfig.dateRange,
      performance,
      trades: trades.filter(trade => {
        if (exportConfig.dateRange.start && trade.date < exportConfig.dateRange.start) return false;
        if (exportConfig.dateRange.end && trade.date > exportConfig.dateRange.end) return false;
        return true;
      })
    };

    // This would generate a comprehensive report
    console.log('Generating report:', reportData);
    alert('Report generation would be implemented with a reporting library');
  };

  const quickExport = (format: 'csv' | 'excel') => {
    setExportConfig(prev => ({ ...prev, format }));
    exportTrades();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Export & Reports</h3>
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">Data Export</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Reports
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'export' ? (
        <div className="space-y-6">
          {/* Quick Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Export</h4>
            <div className="flex gap-3">
              <button
                onClick={() => quickExport('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Export to CSV
              </button>
              <button
                onClick={() => quickExport('excel')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Advanced Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Advanced Export</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportConfig.format}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={exportConfig.dateRange.start}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={exportConfig.dateRange.end}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeCharts}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Charts</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeScreenshots}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, includeScreenshots: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Screenshots</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={exportTrades}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Export History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Exports</h4>
            <div className="text-center py-8 text-gray-500">
              <Download className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent exports</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                reportType === 'performance'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setReportType('performance')}
            >
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h4 className="font-medium text-gray-900">Performance Report</h4>
              </div>
              <p className="text-sm text-gray-600">
                Comprehensive analysis of trading performance including metrics, charts, and insights.
              </p>
            </div>

            <div
              className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                reportType === 'risk'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setReportType('risk')}
            >
              <div className="flex items-center gap-3 mb-3">
                <Settings className="w-6 h-6 text-red-600" />
                <h4 className="font-medium text-gray-900">Risk Analysis</h4>
              </div>
              <p className="text-sm text-gray-600">
                Detailed risk metrics, drawdown analysis, and portfolio exposure breakdown.
              </p>
            </div>

            <div
              className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                reportType === 'custom'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setReportType('custom')}
            >
              <div className="flex items-center gap-3 mb-3">
                <Filter className="w-6 h-6 text-purple-600" />
                <h4 className="font-medium text-gray-900">Custom Report</h4>
              </div>
              <p className="text-sm text-gray-600">
                Build your own report with custom sections, filters, and analysis.
              </p>
            </div>
          </div>

          {/* Report Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={exportConfig.dateRange.start}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={exportConfig.dateRange.end}
                      onChange={(e) => setExportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Sections
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.sections.summary}
                        onChange={(e) => setExportConfig(prev => ({
                          ...prev,
                          sections: { ...prev.sections, summary: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Executive Summary</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.sections.trades}
                        onChange={(e) => setExportConfig(prev => ({
                          ...prev,
                          sections: { ...prev.sections, trades: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Trade Details</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.sections.analytics}
                        onChange={(e) => setExportConfig(prev => ({
                          ...prev,
                          sections: { ...prev.sections, analytics: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Performance Analytics</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.sections.riskMetrics}
                        onChange={(e) => setExportConfig(prev => ({
                          ...prev,
                          sections: { ...prev.sections, riskMetrics: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Risk Metrics</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeCharts}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Charts & Graphs</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeScreenshots}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, includeScreenshots: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Trade Screenshots</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={generateReport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Report Templates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Report Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Monthly Review</h5>
                <p className="text-sm text-gray-600 mb-3">Standard monthly performance review with key metrics.</p>
                <button className="text-sm text-blue-600 hover:text-blue-700">Use Template</button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Quarterly Analysis</h5>
                <p className="text-sm text-gray-600 mb-3">Comprehensive quarterly analysis with detailed insights.</p>
                <button className="text-sm text-blue-600 hover:text-blue-700">Use Template</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 