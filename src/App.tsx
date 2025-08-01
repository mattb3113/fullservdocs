import React, { useState, useEffect } from 'react';
import { FileText, Users, Shield, Star, CheckCircle, Download, CreditCard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PaystubGenerator from './components/PaystubGenerator';
import AuthModal from './components/AuthModal';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'generator'>('landing');

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('buelldocs_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: email,
      avatar: 'JD'
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('buelldocs_user', JSON.stringify(user));
    setShowAuthModal(false);
    setCurrentView('dashboard');
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('buelldocs_user', JSON.stringify(user));
    setShowAuthModal(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('buelldocs_user');
    setCurrentView('landing');
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Function to handle "Start Creating Documents" button click on landing page
  const handleStartCreatingDocuments = () => {
    if (isAuthenticated) {
      setCurrentView('generator'); // If authenticated, go directly to generator
    } else {
      openAuthModal('register'); // Otherwise, open register modal
    }
  };

  if (currentView === 'dashboard' && isAuthenticated) {
    return (
      <Dashboard 
        user={currentUser!}
        onLogout={handleLogout}
        onNavigateToGenerator={() => setCurrentView('generator')}
      />
    );
  }

  if (currentView === 'generator' && isAuthenticated) {
    return (
      <PaystubGenerator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BuellDocs</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => openAuthModal('login')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Document Generation
            <span className="block text-blue-600 mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create authentic-looking paystubs, W-2 forms, and employment documents in minutes. 
            Perfect for novelty purposes, templates, and educational use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartCreatingDocuments} // Updated to use new handler
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Start Creating Documents</span>
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              View Sample Documents
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BuellDocs?</h2>
            <p className="text-xl text-gray-600">Professional-grade document generation with industry-leading accuracy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data is encrypted and never stored permanently. Complete privacy guaranteed.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Calculations</h3>
              <p className="text-gray-600">Automatic tax calculations and deductions based on current federal and state rates.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-gray-600">Generate and download professional PDF documents in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Document Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Types</h2>
            <p className="text-xl text-gray-600">Professional templates for all your document needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Paystubs', desc: 'Professional payroll statements with accurate calculations', icon: '📊' },
              { name: 'W-2 Forms', desc: 'Complete tax forms with all required information', icon: '📋' },
              { name: 'Employment Letters', desc: 'Official employment verification documents', icon: '📝' },
              { name: 'Bank Statements', desc: 'Detailed financial statements with transaction history', icon: '🏦' },
              { name: 'Utility Bills', desc: 'Professional utility and service bills', icon: '⚡' },
              { name: 'Insurance Documents', desc: 'Coverage verification and policy documents', icon: '🛡️' }
            ].map((doc, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{doc.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.name}</h3>
                <p className="text-gray-600 text-sm">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Pay per document or choose a bundle for better value</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Per Document</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">$9.99</div>
              <p className="text-gray-600 mb-6">Perfect for one-time use</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Single document generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>PDF download</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>24/7 support</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Choose Plan
              </button>
            </div>

            <div className="border-2 border-blue-500 rounded-lg p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Document Bundle</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">$24.99</div>
              <p className="text-gray-600 mb-6">Best value for multiple documents</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>5 document generations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>All document types</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>30-day validity</span>
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Choose Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6" />
                <span className="text-xl font-bold">BuellDocs</span>
              </div>
              <p className="text-gray-400">Professional document generation for novelty and educational purposes.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Paystub Generation</li>
                <li>W-2 Forms</li>
                <li>Employment Letters</li>
                <li>Bank Statements</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal Notice</h4>
              <p className="text-gray-400 text-sm">
                All documents are for novelty purposes only. Not intended for fraudulent use.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BuellDocs. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
}

export default App;
