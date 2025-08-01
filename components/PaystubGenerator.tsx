import React, { useState } from 'react';
import { ArrowLeft, Download, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface PaystubGeneratorProps {
  user: User;
  onBack: () => void;
}

interface PaystubData {
  // Employee Information
  employeeName: string;
  employeeAddress: string;
  employeeCity: string;
  employeeState: string;
  employeeZip: string;
  employeeSSN: string;
  
  // Employer Information
  employerName: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  employerEIN: string;
  
  // Pay Information
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  payFrequency: string;
  grossPay: number;
  hourlyRate: number;
  hoursWorked: number;
  
  // Deductions
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  stateDisability: number;
  healthInsurance: number;
  retirement401k: number;
  
  // YTD Totals
  ytdGrossPay: number;
  ytdFederalTax: number;
  ytdStateTax: number;
  ytdSocialSecurity: number;
  ytdMedicare: number;
}

const PaystubGenerator: React.FC<PaystubGeneratorProps> = ({ user, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [formData, setFormData] = useState<PaystubData>({
    employeeName: '',
    employeeAddress: '',
    employeeCity: '',
    employeeState: '',
    employeeZip: '',
    employeeSSN: '',
    employerName: '',
    employerAddress: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    employerEIN: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: '',
    payFrequency: 'biweekly',
    grossPay: 0,
    hourlyRate: 0,
    hoursWorked: 0,
    federalTax: 0,
    stateTax: 0,
    socialSecurity: 0,
    medicare: 0,
    stateDisability: 0,
    healthInsurance: 0,
    retirement401k: 0,
    ytdGrossPay: 0,
    ytdFederalTax: 0,
    ytdStateTax: 0,
    ytdSocialSecurity: 0,
    ytdMedicare: 0
  });

  const updateFormData = (field: keyof PaystubData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate taxes when gross pay changes
    if (field === 'grossPay' && typeof value === 'number') {
      calculateTaxes(value);
    }
    
    // Calculate gross pay from hourly rate and hours
    if ((field === 'hourlyRate' || field === 'hoursWorked') && typeof value === 'number') {
      const rate = field === 'hourlyRate' ? value : formData.hourlyRate;
      const hours = field === 'hoursWorked' ? value : formData.hoursWorked;
      const gross = rate * hours;
      setFormData(prev => ({ ...prev, grossPay: gross }));
      calculateTaxes(gross);
    }
  };

  const calculateTaxes = (grossPay: number) => {
    // Federal tax calculation (simplified)
    const federalRate = grossPay <= 1000 ? 0.10 : grossPay <= 2000 ? 0.12 : 0.22;
    const federalTax = grossPay * federalRate;
    
    // State tax (5% average)
    const stateTax = grossPay * 0.05;
    
    // Social Security (6.2%)
    const socialSecurity = grossPay * 0.062;
    
    // Medicare (1.45%)
    const medicare = grossPay * 0.0145;
    
    // State disability (1%)
    const stateDisability = grossPay * 0.01;
    
    setFormData(prev => ({
      ...prev,
      federalTax: Math.round(federalTax * 100) / 100,
      stateTax: Math.round(stateTax * 100) / 100,
      socialSecurity: Math.round(socialSecurity * 100) / 100,
      medicare: Math.round(medicare * 100) / 100,
      stateDisability: Math.round(stateDisability * 100) / 100
    }));
  };

  const calculateNetPay = () => {
    const totalDeductions = formData.federalTax + formData.stateTax + formData.socialSecurity + 
                           formData.medicare + formData.stateDisability + formData.healthInsurance + 
                           formData.retirement401k;
    return formData.grossPay - totalDeductions;
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.employeeName && formData.employeeAddress && formData.employeeCity && 
               formData.employeeState && formData.employeeZip;
      case 2:
        return formData.employerName && formData.employerAddress && formData.employerCity && 
               formData.employerState && formData.employerZip;
      case 3:
        return formData.payPeriodStart && formData.payPeriodEnd && formData.payDate && 
               (formData.grossPay > 0 || (formData.hourlyRate > 0 && formData.hoursWorked > 0));
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerate = () => {
    setShowPayment(true);
  };

  const handlePayment = async () => {
    setIsGenerating(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPaymentComplete(true);
    setIsGenerating(false);
  };

  const downloadDocument = () => {
    // In a real implementation, this would generate and download a PDF
    const element = document.createElement('a');
    const file = new Blob([generatePaystubHTML()], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `paystub-${formData.employeeName.replace(/\s+/g, '-')}-${formData.payDate}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePaystubHTML = () => {
    const netPay = calculateNetPay();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Paystub - ${formData.employeeName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .paystub { max-width: 800px; margin: 0 auto; border: 2px solid #000; }
        .header { background: #f0f0f0; padding: 15px; text-align: center; border-bottom: 1px solid #000; }
        .section { padding: 15px; border-bottom: 1px solid #ccc; }
        .row { display: flex; justify-content: space-between; margin: 5px 0; }
        .col { flex: 1; }
        .amount { text-align: right; font-weight: bold; }
        .total { background: #f9f9f9; font-weight: bold; }
    </style>
</head>
<body>
    <div class="paystub">
        <div class="header">
            <h1>PAYROLL STATEMENT</h1>
            <h2>${formData.employerName}</h2>
        </div>
        
        <div class="section">
            <div class="row">
                <div class="col">
                    <strong>Employee:</strong><br>
                    ${formData.employeeName}<br>
                    ${formData.employeeAddress}<br>
                    ${formData.employeeCity}, ${formData.employeeState} ${formData.employeeZip}
                </div>
                <div class="col">
                    <strong>Employer:</strong><br>
                    ${formData.employerName}<br>
                    ${formData.employerAddress}<br>
                    ${formData.employerCity}, ${formData.employerState} ${formData.employerZip}
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="row">
                <div class="col"><strong>Pay Period:</strong> ${formData.payPeriodStart} - ${formData.payPeriodEnd}</div>
                <div class="col"><strong>Pay Date:</strong> ${formData.payDate}</div>
            </div>
        </div>
        
        <div class="section">
            <h3>Earnings</h3>
            ${formData.hourlyRate > 0 ? `
            <div class="row">
                <div class="col">Regular Hours (${formData.hoursWorked} hrs @ $${formData.hourlyRate}/hr)</div>
                <div class="amount">$${formData.grossPay.toFixed(2)}</div>
            </div>
            ` : `
            <div class="row">
                <div class="col">Gross Pay</div>
                <div class="amount">$${formData.grossPay.toFixed(2)}</div>
            </div>
            `}
            <div class="row total">
                <div class="col"><strong>Total Earnings</strong></div>
                <div class="amount"><strong>$${formData.grossPay.toFixed(2)}</strong></div>
            </div>
        </div>
        
        <div class="section">
            <h3>Deductions</h3>
            <div class="row">
                <div class="col">Federal Tax</div>
                <div class="amount">$${formData.federalTax.toFixed(2)}</div>
            </div>
            <div class="row">
                <div class="col">State Tax</div>
                <div class="amount">$${formData.stateTax.toFixed(2)}</div>
            </div>
            <div class="row">
                <div class="col">Social Security</div>
                <div class="amount">$${formData.socialSecurity.toFixed(2)}</div>
            </div>
            <div class="row">
                <div class="col">Medicare</div>
                <div class="amount">$${formData.medicare.toFixed(2)}</div>
            </div>
            ${formData.stateDisability > 0 ? `
            <div class="row">
                <div class="col">State Disability</div>
                <div class="amount">$${formData.stateDisability.toFixed(2)}</div>
            </div>
            ` : ''}
            ${formData.healthInsurance > 0 ? `
            <div class="row">
                <div class="col">Health Insurance</div>
                <div class="amount">$${formData.healthInsurance.toFixed(2)}</div>
            </div>
            ` : ''}
            ${formData.retirement401k > 0 ? `
            <div class="row">
                <div class="col">401(k) Contribution</div>
                <div class="amount">$${formData.retirement401k.toFixed(2)}</div>
            </div>
            ` : ''}
            <div class="row total">
                <div class="col"><strong>Total Deductions</strong></div>
                <div class="amount"><strong>$${(formData.federalTax + formData.stateTax + formData.socialSecurity + formData.medicare + formData.stateDisability + formData.healthInsurance + formData.retirement401k).toFixed(2)}</strong></div>
            </div>
        </div>
        
        <div class="section total">
            <div class="row">
                <div class="col"><h2>NET PAY</h2></div>
                <div class="amount"><h2>$${netPay.toFixed(2)}</h2></div>
            </div>
        </div>
        
        <div class="section">
            <p style="text-align: center; font-size: 12px; color: #666;">
                This document is for novelty purposes only. Generated by BuellDocs.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Generated!</h2>
          <p className="text-gray-600 mb-6">Your paystub has been successfully created and is ready for download.</p>
          
          <div className="space-y-4">
            <button
              onClick={downloadDocument}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download Paystub</span>
            </button>
            
            <button
              onClick={onBack}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
            <p className="text-gray-600">Generate your professional paystub</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">Paystub Generation</span>
              <span className="font-bold text-lg">$9.99</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Processing...' : 'Complete Purchase'}
            </button>
            
            <button
              onClick={() => setShowPayment(false)}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Review
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment processing. Your information is protected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Paystub Generator</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.avatar}
              </div>
              <span className="text-sm text-gray-600">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Employee Info</span>
            <span>Employer Info</span>
            <span>Pay Details</span>
            <span>Review</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Step 1: Employee Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Information</h2>
                <p className="text-gray-600">Enter the employee's personal details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => updateFormData('employeeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSN (Optional)</label>
                  <input
                    type="text"
                    value={formData.employeeSSN}
                    onChange={(e) => updateFormData('employeeSSN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="XXX-XX-1234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData.employeeAddress}
                  onChange={(e) => updateFormData('employeeAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.employeeCity}
                    onChange={(e) => updateFormData('employeeCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={formData.employeeState}
                    onChange={(e) => updateFormData('employeeState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="CA">California</option>
                    <option value="FL">Florida</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    {/* Add more states as needed */}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.employeeZip}
                    onChange={(e) => updateFormData('employeeZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employer Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Employer Information</h2>
                <p className="text-gray-600">Enter the employer's company details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => updateFormData('employerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ABC Corporation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EIN (Optional)</label>
                  <input
                    type="text"
                    value={formData.employerEIN}
                    onChange={(e) => updateFormData('employerEIN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12-3456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData.employerAddress}
                  onChange={(e) => updateFormData('employerAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="456 Business Ave"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.employerCity}
                    onChange={(e) => updateFormData('employerCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={formData.employerState}
                    onChange={(e) => updateFormData('employerState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="CA">California</option>
                    <option value="FL">Florida</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.employerZip}
                    onChange={(e) => updateFormData('employerZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pay Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pay Details</h2>
                <p className="text-gray-600">Enter pay period and earnings information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period Start *</label>
                  <input
                    type="date"
                    value={formData.payPeriodStart}
                    onChange={(e) => updateFormData('payPeriodStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period End *</label>
                  <input
                    type="date"
                    value={formData.payPeriodEnd}
                    onChange={(e) => updateFormData('payPeriodEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pay Date *</label>
                  <input
                    type="date"
                    value={formData.payDate}
                    onChange={(e) => updateFormData('payDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
                <select
                  value={formData.payFrequency}
                  onChange={(e) => updateFormData('payFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="semimonthly">Semi-monthly</option>
                </select>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => updateFormData('hourlyRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="25.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hoursWorked || ''}
                      onChange={(e) => updateFormData('hoursWorked', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="80"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gross Pay *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.grossPay || ''}
                      onChange={(e) => updateFormData('grossPay', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2000.00"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions (Auto-calculated)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Federal Tax</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.federalTax}
                      onChange={(e) => updateFormData('federalTax', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State Tax</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.stateTax}
                      onChange={(e) => updateFormData('stateTax', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Social Security</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.socialSecurity}
                      onChange={(e) => updateFormData('socialSecurity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicare</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.medicare}
                      onChange={(e) => updateFormData('medicare', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Insurance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.healthInsurance || ''}
                      onChange={(e) => updateFormData('healthInsurance', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">401(k) Contribution</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.retirement401k || ''}
                      onChange={(e) => updateFormData('retirement401k', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Net Pay:</span>
                  <span className="text-blue-600">${calculateNetPay().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Paystub</h2>
                <p className="text-gray-600">Please review all information before generating your document</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Employee Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {formData.employeeName}</p>
                      <p><strong>Address:</strong> {formData.employeeAddress}</p>
                      <p><strong>City, State ZIP:</strong> {formData.employeeCity}, {formData.employeeState} {formData.employeeZip}</p>
                      {formData.employeeSSN && <p><strong>SSN:</strong> {formData.employeeSSN}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Employer Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Company:</strong> {formData.employerName}</p>
                      <p><strong>Address:</strong> {formData.employerAddress}</p>
                      <p><strong>City, State ZIP:</strong> {formData.employerCity}, {formData.employerState} {formData.employerZip}</p>
                      {formData.employerEIN && <p><strong>EIN:</strong> {formData.employerEIN}</p>}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Pay Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <p><strong>Pay Period:</strong> {formData.payPeriodStart} to {formData.payPeriodEnd}</p>
                    <p><strong>Pay Date:</strong> {formData.payDate}</p>
                    <p><strong>Frequency:</strong> {formData.payFrequency}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Earnings</h4>
                      <div className="space-y-1 text-sm">
                        {formData.hourlyRate > 0 && (
                          <p>Regular Hours: {formData.hoursWorked} hrs @ ${formData.hourlyRate}/hr</p>
                        )}
                        <p className="font-semibold">Gross Pay: ${formData.grossPay.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Deductions</h4>
                      <div className="space-y-1 text-sm">
                        <p>Federal Tax: ${formData.federalTax.toFixed(2)}</p>
                        <p>State Tax: ${formData.stateTax.toFixed(2)}</p>
                        <p>Social Security: ${formData.socialSecurity.toFixed(2)}</p>
                        <p>Medicare: ${formData.medicare.toFixed(2)}</p>
                        {formData.healthInsurance > 0 && <p>Health Insurance: ${formData.healthInsurance.toFixed(2)}</p>}
                        {formData.retirement401k > 0 && <p>401(k): ${formData.retirement401k.toFixed(2)}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Net Pay:</span>
                    <span className="text-green-600">${calculateNetPay().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800">Important Notice</p>
                  <p className="text-yellow-700">This document is for novelty purposes only and should not be used for fraudulent activities.</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Generate Paystub - $9.99</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystubGenerator;
