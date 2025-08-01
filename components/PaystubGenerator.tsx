import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface PaystubGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
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
  payRate: number;
  hoursWorked: number;
  
  // Deductions (optional - will be calculated if not provided)
  federalTax?: number;
  stateTax?: number;
  socialSecurity?: number;
  medicare?: number;
  stateDisability?: number;
}

const PaystubGenerator: React.FC<PaystubGeneratorProps> = ({ user, onBack, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    payRate: 0,
    hoursWorked: 0
  });
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof PaystubData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.employeeName && formData.employeeAddress && 
                 formData.employeeCity && formData.employeeState && 
                 formData.employeeZip && formData.employeeSSN);
      case 2:
        return !!(formData.employerName && formData.employerAddress && 
                 formData.employerCity && formData.employerState && 
                 formData.employerZip && formData.employerEIN);
      case 3:
        return !!(formData.payPeriodStart && formData.payPeriodEnd && 
                 formData.payDate && formData.payRate > 0 && formData.hoursWorked > 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      alert('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generatePaystub = async () => {
    setIsGenerating(true);
    
    try {
      // Use the DocumentGenerator class from the global scope
      if (typeof window !== 'undefined' && (window as any).DocumentGenerator) {
        const generator = new (window as any).DocumentGenerator();
        const result = await generator.generateDocument('paystub', formData);
        
        if (result.success) {
          setGeneratedDocument(result.document.content);
          
          // Save to user's document history
          const savedDocuments = localStorage.getItem('buelldocs_documents');
          const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
          
          const newDocument = {
            id: Date.now().toString(),
            type: 'paystub',
            name: `Paystub - ${formData.employeeName}`,
            createdAt: new Date().toISOString(),
            status: 'completed'
          };
          
          documents.unshift(newDocument);
          localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
          
          setCurrentStep(4);
        } else {
          alert('Failed to generate paystub: ' + result.error);
        }
      } else {
        // Fallback: Generate a simple paystub HTML
        const grossPay = formData.payRate * formData.hoursWorked;
        const federalTax = grossPay * 0.12;
        const stateTax = grossPay * 0.05;
        const socialSecurity = grossPay * 0.062;
        const medicare = grossPay * 0.0145;
        const totalDeductions = federalTax + stateTax + socialSecurity + medicare;
        const netPay = grossPay - totalDeductions;
        
        const paystubHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 5px;">${formData.employerName}</h1>
              <p style="margin: 0; color: #666;">${formData.employerAddress}</p>
              <p style="margin: 0; color: #666;">${formData.employerCity}, ${formData.employerState} ${formData.employerZip}</p>
              <p style="margin: 0; color: #666;">EIN: ${formData.employerEIN}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div>
                <h3 style="color: #333; margin-bottom: 10px;">Employee Information</h3>
                <p style="margin: 2px 0;"><strong>Name:</strong> ${formData.employeeName}</p>
                <p style="margin: 2px 0;"><strong>Address:</strong> ${formData.employeeAddress}</p>
                <p style="margin: 2px 0;"><strong>City, State ZIP:</strong> ${formData.employeeCity}, ${formData.employeeState} ${formData.employeeZip}</p>
                <p style="margin: 2px 0;"><strong>SSN:</strong> ***-**-${formData.employeeSSN.slice(-4)}</p>
              </div>
              <div>
                <h3 style="color: #333; margin-bottom: 10px;">Pay Period</h3>
                <p style="margin: 2px 0;"><strong>Start:</strong> ${new Date(formData.payPeriodStart).toLocaleDateString()}</p>
                <p style="margin: 2px 0;"><strong>End:</strong> ${new Date(formData.payPeriodEnd).toLocaleDateString()}</p>
                <p style="margin: 2px 0;"><strong>Pay Date:</strong> ${new Date(formData.payDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
                  <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Rate</th>
                  <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Hours</th>
                  <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">Regular Pay</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${formData.payRate.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formData.hoursWorked}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${grossPay.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td style="border: 1px solid #ddd; padding: 10px;" colspan="3">Gross Pay</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${grossPay.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Deductions</th>
                  <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">Federal Tax</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${federalTax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">State Tax</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${stateTax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">Social Security</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${socialSecurity.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">Medicare</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${medicare.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td style="border: 1px solid #ddd; padding: 10px;">Total Deductions</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${totalDeductions.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="text-align: right; font-size: 18px; font-weight: bold; color: #333; border-top: 2px solid #333; padding-top: 10px;">
              Net Pay: $${netPay.toFixed(2)}
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
              <p style="margin: 0; font-size: 12px; color: #856404;">
                <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
                Not intended for fraudulent use or misrepresentation.
              </p>
            </div>
          </div>
        `;
        
        setGeneratedDocument(paystubHTML);
        
        // Save to user's document history
        const savedDocuments = localStorage.getItem('buelldocs_documents');
        const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
        
        const newDocument = {
          id: Date.now().toString(),
          type: 'paystub',
          name: `Paystub - ${formData.employeeName}`,
          createdAt: new Date().toISOString(),
          status: 'completed'
        };
        
        documents.unshift(newDocument);
        localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
        
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error generating paystub:', error);
      alert('An error occurred while generating the paystub. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPaystub = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paystub-${formData.employeeName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printPaystub = () => {
    if (!generatedDocument) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedDocument);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Paystub Generator</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.avatar}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-900">{user.name}</span>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Generate Paystub</h1>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Employee Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Employee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Security Number *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeSSN}
                    onChange={(e) => handleInputChange('employeeSSN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123-45-6789"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeAddress}
                    onChange={(e) => handleInputChange('employeeAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeCity}
                    onChange={(e) => handleInputChange('employeeCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Chicago"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeState}
                    onChange={(e) => handleInputChange('employeeState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="IL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeZip}
                    onChange={(e) => handleInputChange('employeeZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="60601"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employer Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Employer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Acme Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer ID Number (EIN) *
                  </label>
                  <input
                    type="text"
                    value={formData.employerEIN}
                    onChange={(e) => handleInputChange('employerEIN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12-3456789"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address *
                  </label>
                  <input
                    type="text"
                    value={formData.employerAddress}
                    onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="456 Business Ave"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.employerCity}
                    onChange={(e) => handleInputChange('employerCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Chicago"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.employerState}
                    onChange={(e) => handleInputChange('employerState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="IL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.employerZip}
                    onChange={(e) => handleInputChange('employerZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="60601"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pay Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pay Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Period Start *
                  </label>
                  <input
                    type="date"
                    value={formData.payPeriodStart}
                    onChange={(e) => handleInputChange('payPeriodStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Period End *
                  </label>
                  <input
                    type="date"
                    value={formData.payPeriodEnd}
                    onChange={(e) => handleInputChange('payPeriodEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Date *
                  </label>
                  <input
                    type="date"
                    value={formData.payDate}
                    onChange={(e) => handleInputChange('payDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payRate}
                    onChange={(e) => handleInputChange('payRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours Worked *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hoursWorked}
                    onChange={(e) => handleInputChange('hoursWorked', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Pay (Calculated)
                  </label>
                  <input
                    type="text"
                    value={`$${(formData.payRate * formData.hoursWorked).toFixed(2)}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview and Generate */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview & Generate</h2>
              
              {!generatedDocument ? (
                <div className="text-center py-8">
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Generate</h3>
                    <p className="text-blue-700 mb-4">
                      Review your information and click generate to create your paystub.
                    </p>
                    <div className="text-sm text-blue-600 space-y-1">
                      <p><strong>Employee:</strong> {formData.employeeName}</p>
                      <p><strong>Employer:</strong> {formData.employerName}</p>
                      <p><strong>Pay Period:</strong> {formData.payPeriodStart} to {formData.payPeriodEnd}</p>
                      <p><strong>Gross Pay:</strong> ${(formData.payRate * formData.hoursWorked).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={generatePaystub}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    <FileText className="h-5 w-5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate Paystub'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated Paystub</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={printPaystub}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={downloadPaystub}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: generatedDocument }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            {currentStep < 4 && (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystubGenerator;
