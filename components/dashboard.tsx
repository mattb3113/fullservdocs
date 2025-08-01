import React, { useState } from 'react';
import { FileText, Plus, History, Settings, LogOut, User, CreditCard, Download, Eye } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToGenerator: () => void;
}

interface Document {
  id: string;
  type: string;
  name: string;
  createdAt: string;
  status: 'completed' | 'processing';
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigateToGenerator }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [documents] = useState<Document[]>([
    {
      id: '1',
      type: 'paystub',
      name: 'Paystub - John Doe - March 2025',
      createdAt: '2025-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'w2',
      name: 'W-2 Form - John Doe - 2024',
      createdAt: '2025-01-14T15:45:00Z',
      status: 'completed'
    }
  ]);

  const getDocumentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      paystub: '📊',
      w2: '📋',
      employment: '📝',
      bank: '🏦',
      utility: '⚡',
      insurance: '🛡️'
    };
    return icons[type] || '📄';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'generate' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Generate Documents</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'history' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <History className="h-5 w-5" />
                    <span>Document History</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'billing' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Billing</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'settings' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                  <p className="text-gray-600">Manage your documents and account settings</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Documents</p>
                        <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">2</p>
                      </div>
                      <Plus className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Credits Remaining</p>
                        <p className="text-2xl font-bold text-gray-900">3</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Documents */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
                  </div>
                  <div className="p-6">
                    {documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.slice(0, 3).map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-500">Created {formatDate(doc.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No documents yet. Create your first document!</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generate' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Generate Documents</h1>
                  <p className="text-gray-600">Choose a document type to get started</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { type: 'paystub', name: 'Paystub', desc: 'Professional payroll statements', icon: '📊', popular: true },
                    { type: 'w2', name: 'W-2 Form', desc: 'Annual tax forms', icon: '📋', popular: true },
                    { type: 'employment', name: 'Employment Letter', desc: 'Verification letters', icon: '📝', popular: false },
                    { type: 'bank', name: 'Bank Statement', desc: 'Financial statements', icon: '🏦', popular: false },
                    { type: 'utility', name: 'Utility Bill', desc: 'Service bills', icon: '⚡', popular: false },
                    { type: 'insurance', name: 'Insurance Document', desc: 'Coverage verification', icon: '🛡️', popular: false }
                  ].map((docType) => (
                    <div key={docType.type} className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      {docType.popular && (
                        <div className="absolute -top-2 -right-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Popular</span>
                        </div>
                      )}
                      <div className="text-3xl mb-3">{docType.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{docType.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{docType.desc}</p>
                      <button
                        onClick={onNavigateToGenerator}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create {docType.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Document History</h1>
                  <p className="text-gray-600">View and manage your generated documents</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    {documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-500">Created {formatDate(doc.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                doc.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {doc.status}
                              </span>
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No documents yet. Create your first document!</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Billing & Credits</h1>
                  <p className="text-gray-600">Manage your account credits and billing information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Credits</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                    <p className="text-gray-600 mb-4">Document generations remaining</p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Purchase More Credits
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Document Bundle</span>
                        <span className="font-semibold">$24.99</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Jan 15, 2025</span>
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                  <p className="text-gray-600">Manage your account preferences</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
