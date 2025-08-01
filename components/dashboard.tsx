import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  Plus, 
  Download, 
  Eye, 
  Copy,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
}

interface Document {
  id: string;
  type: 'paystub' | 'w2';
  name: string;
  createdAt: string;
  status: 'completed' | 'processing';
}

interface DashboardStats {
  totalDocuments: number;
  thisMonth: number;
  lastGenerated: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToPaystub: () => void;
  onNavigateToW2: () => void;
  onNavigateToDashboard: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onNavigateToPaystub, 
  onNavigateToW2,
  onNavigateToDashboard 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    thisMonth: 0,
    lastGenerated: 'Never'
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'templates' | 'settings'>('overview');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Load documents from localStorage
    const savedDocuments = localStorage.getItem('buelldocs_documents');
    const userDocuments = savedDocuments ? JSON.parse(savedDocuments) : [];
    setDocuments(userDocuments);

    // Calculate stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthDocs = userDocuments.filter((doc: Document) => {
      const docDate = new Date(doc.createdAt);
      return docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;
    });

    const lastDoc = userDocuments.length > 0 ? userDocuments[0] : null;
    const lastGenerated = lastDoc 
      ? new Date(lastDoc.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      : 'Never';

    setStats({
      totalDocuments: userDocuments.length,
      thisMonth: thisMonthDocs.length,
      lastGenerated
    });
  };

  const handleDocumentAction = (action: string, docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    switch (action) {
      case 'download':
        // Simulate download
        alert(`Downloading ${doc.name}...`);
        break;
      case 'view':
        // Simulate view
        alert(`Opening ${doc.name} for preview...`);
        break;
      case 'duplicate':
        // Simulate duplicate
        alert(`Creating a copy of ${doc.name}...`);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'paystub':
        return '📊';
      case 'w2':
        return '📋';
      default:
        return '📄';
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'paystub':
        return 'Paystub';
      case 'w2':
        return 'W-2 Form';
      default:
        return 'Document';
    }
  };

  const memberSince = new Date(user.joinDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BuellDocs</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.avatar}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'documents' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span>My Documents</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors opacity-60 cursor-not-allowed ${
                      activeTab === 'templates' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700'
                    }`}
                    disabled
                  >
                    <Copy className="h-5 w-5" />
                    <span>Templates</span>
                    <span className="text-xs text-gray-400 ml-auto">Soon</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors opacity-60 cursor-not-allowed ${
                      activeTab === 'settings' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700'
                    }`}
                    disabled
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                    <span className="text-xs text-gray-400 ml-auto">Soon</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-gray-600">
                    Member since {memberSince} • Ready to create your next document?
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Documents</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Generated</p>
                        <p className="text-lg font-bold text-gray-900">{stats.lastGenerated}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={onNavigateToPaystub}
                      className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-2xl">📊</div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Generate Paystub</h3>
                        <p className="text-sm text-gray-600">Create professional payroll statements</p>
                      </div>
                    </button>

                    <button
                      onClick={onNavigateToW2}
                      className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-2xl">📋</div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">Generate W-2 Form</h3>
                        <p className="text-sm text-gray-600">Create complete tax forms</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                {documents.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl">{getDocumentIcon(doc.type)}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-600">{formatDate(doc.createdAt)}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
                  <div className="flex space-x-3">
                    <button
                      onClick={onNavigateToPaystub}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Paystub</span>
                    </button>
                    <button
                      onClick={onNavigateToW2}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New W-2</span>
                    </button>
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first document</p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={onNavigateToPaystub}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Paystub
                      </button>
                      <button
                        onClick={onNavigateToW2}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Create W-2
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Document History</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-6 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getDocumentIcon(doc.type)}</div>
                            <div>
                              <h3 className="font-medium text-gray-900">{doc.name}</h3>
                              <p className="text-sm text-gray-600">
                                {getDocumentTypeName(doc.type)} • {formatDate(doc.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {doc.status}
                            </span>
                            <button
                              onClick={() => handleDocumentAction('view', doc.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDocumentAction('download', doc.id)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDocumentAction('duplicate', doc.id)}
                              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Templates Coming Soon</h3>
                <p className="text-gray-600">
                  Save and reuse your document templates for faster generation.
                </p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
                <p className="text-gray-600">
                  Manage your account preferences and document settings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
