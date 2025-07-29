// Document generation engine
class DocumentGenerator {
    constructor() {
        this.templates = {};
        this.calculationEngines = {};
        this.qualityCheckers = {};
        this.init();
    }

    init() {
        this.loadTemplates();
        this.initCalculationEngines();
        this.initQualityCheckers();
    }

    loadTemplates() {
        // Template definitions for different document types
        this.templates = {
            paystub: {
                name: 'Standard Paystub',
                fields: [
                    'employerName', 'employeeInfo', 'payPeriod', 'grossPay',
                    'federalTax', 'stateTax', 'socialSecurity', 'medicare',
                    'netPay', 'ytdGross', 'ytdTax'
                ],
                calculations: ['taxes', 'netPay', 'ytdTotals'],
                validations: ['payPeriodConsistency', 'taxCalculations']
            },
            
            bankStatement: {
                name: 'Bank Statement',
                fields: [
                    'bankName', 'accountHolder', 'accountNumber', 'routingNumber',
                    'statementPeriod', 'openingBalance', 'closingBalance', 'transactions'
                ],
                calculations: ['runningBalance', 'totalDebits', 'totalCredits'],
                validations: ['balanceConsistency', 'transactionDates']
            },
            
            w2Form: {
                name: 'W-2 Tax Form',
                fields: [
                    'employerInfo', 'employeeInfo', 'wagesAndTips', 'federalTaxWithheld',
                    'socialSecurityWages', 'socialSecurityTax', 'medicareWages', 'medicareTax'
                ],
                calculations: ['taxWithholdings', 'socialSecurityCalc', 'medicareCalc'],
                validations: ['taxFormCompliance', 'wageConsistency']
            }
        };
    }

    initCalculationEngines() {
        this.calculationEngines = {
            taxes: (grossPay, filingStatus = 'single') => {
                const federalRate = this.getFederalTaxRate(grossPay, filingStatus);
                const stateRate = 0.05; // Simplified state tax rate
                const socialSecurityRate = 0.062;
                const medicareRate = 0.0145;

                return {
                    federal: grossPay * federalRate,
                    state: grossPay * stateRate,
                    socialSecurity: grossPay * socialSecurityRate,
                    medicare: grossPay * medicareRate
                };
            },

            netPay: (grossPay, deductions) => {
                const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
                return grossPay - totalDeductions;
            },

            ytdTotals: (currentAmount, previousYtd = 0) => {
                return previousYtd + currentAmount;
            },

            runningBalance: (startingBalance, transactions) => {
                let balance = startingBalance;
                const balanceHistory = [balance];
                
                transactions.forEach(transaction => {
                    balance += transaction.amount;
                    balanceHistory.push(balance);
                });
                
                return balanceHistory;
            }
        };
    }

    initQualityCheckers() {
        this.qualityCheckers = {
            payPeriodConsistency: (data) => {
                // Check if pay amounts are consistent with pay period
                const { grossPay, payPeriod } = data;
                const annualizedPay = this.annualizePay(grossPay, payPeriod);
                
                return {
                    passed: annualizedPay >= 15000 && annualizedPay <= 500000,
                    message: annualizedPay < 15000 ? 'Pay seems unusually low' : 
                            annualizedPay > 500000 ? 'Pay seems unusually high' : 'Pay is within normal range'
                };
            },

            taxCalculations: (data) => {
                const { grossPay, federalTax, stateTax } = data;
                const expectedTaxes = this.calculationEngines.taxes(grossPay);
                const federalDiff = Math.abs(federalTax - expectedTaxes.federal) / expectedTaxes.federal;
                const stateDiff = Math.abs(stateTax - expectedTaxes.state) / expectedTaxes.state;
                
                return {
                    passed: federalDiff < 0.1 && stateDiff < 0.1,
                    message: 'Tax calculations appear accurate',
                    suggestions: federalDiff > 0.1 ? ['Check federal tax calculation'] : 
                               stateDiff > 0.1 ? ['Check state tax calculation'] : []
                };
            },

            balanceConsistency: (data) => {
                const { openingBalance, closingBalance, transactions } = data;
                const calculatedBalance = transactions.reduce((balance, transaction) => {
                    return balance + transaction.amount;
                }, openingBalance);
                
                const difference = Math.abs(calculatedBalance - closingBalance);
                
                return {
                    passed: difference < 0.01,
                    message: difference < 0.01 ? 'Balance calculations are accurate' : 
                            `Balance discrepancy of $${difference.toFixed(2)} detected`,
                    calculatedBalance
                };
            }
        };
    }

    async generateDocument(documentType, userData) {
        try {
            // Step 1: Validate input data
            const validationResult = this.validateInputData(documentType, userData);
            if (!validationResult.isValid) {
                throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
            }

            // Step 2: Get template
            const template = this.getTemplate(documentType);
            if (!template) {
                throw new Error(`Template not found for document type: ${documentType}`);
            }

            // Step 3: Process calculations
            const processedData = await this.processCalculations(documentType, userData);

            // Step 4: Apply quality checks
            const qualityResult = this.runQualityChecks(documentType, processedData);
            
            // Step 5: Generate document structure
            const documentStructure = this.buildDocumentStructure(template, processedData);

            // Step 6: Apply formatting and styling
            const formattedDocument = this.applyFormatting(documentType, documentStructure);

            // Step 7: Generate final output
            const finalDocument = await this.renderDocument(formattedDocument);

            return {
                success: true,
                document: finalDocument,
                metadata: {
                    documentType,
                    generatedAt: new Date().toISOString(),
                    documentId: this.generateDocumentId(documentType),
                    qualityScore: qualityResult.score,
                    warnings: qualityResult.warnings
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    validateInputData(documentType, userData) {
        const template = this.templates[documentType];
        if (!template) {
            return { isValid: false, errors: ['Invalid document type'] };
        }

        const errors = [];
        const requiredFields = template.fields;

        requiredFields.forEach(field => {
            if (!userData[field] && userData[field] !== 0) {
                errors.push(`Missing required field: ${field}`);
            }
        });

        // Type-specific validations
        if (documentType === 'paystub') {
            if (userData.grossPay && userData.grossPay < 0) {
                errors.push('Gross pay cannot be negative');
            }
        }

        if (documentType === 'bankStatement') {
            if (userData.accountNumber && userData.accountNumber.length < 8) {
                errors.push('Account number must be at least 8 digits');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    getTemplate(documentType) {
        return this.templates[documentType] || null;
    }

    async processCalculations(documentType, userData) {
        const processedData = { ...userData };
        const template = this.templates[documentType];

        if (!template.calculations) {
            return processedData;
        }

        for (const calculationType of template.calculations) {
            switch (calculationType) {
                case 'taxes':
                    if (processedData.grossPay) {
                        const taxes = this.calculationEngines.taxes(processedData.grossPay);
                        processedData.calculatedFederalTax = taxes.federal;
                        processedData.calculatedStateTax = taxes.state;
                        processedData.calculatedSocialSecurity = taxes.socialSecurity;
                        processedData.calculatedMedicare = taxes.medicare;
                    }
                    break;

                case 'netPay':
                    if (processedData.grossPay) {
                        const deductions = {
                            federal: processedData.federalTax || processedData.calculatedFederalTax || 0,
                            state: processedData.stateTax || processedData.calculatedStateTax || 0,
                            socialSecurity: processedData.calculatedSocialSecurity || 0,
                            medicare: processedData.calculatedMedicare || 0
                        };
                        processedData.netPay = this.calculationEngines.netPay(processedData.grossPay, deductions);
                    }
                    break;

                case 'runningBalance':
                    if (processedData.openingBalance && processedData.transactions) {
                        processedData.balanceHistory = this.calculationEngines.runningBalance(
                            processedData.openingBalance, 
                            processedData.transactions
                        );
                    }
                    break;
            }
        }

        return processedData;
    }

    runQualityChecks(documentType, processedData) {
        const template = this.templates[documentType];
        const results = [];
        let totalScore = 0;
        const warnings = [];

        if (!template.validations) {
            return { score: 100, warnings: [], results: [] };
        }

        template.validations.forEach(validationType => {
            if (this.qualityCheckers[validationType]) {
                const result = this.qualityCheckers[validationType](processedData);
                results.push({
                    type: validationType,
                    ...result
                });

                if (result.passed) {
                    totalScore += 100 / template.validations.length;
                } else {
                    warnings.push(result.message);
                }
            }
        });

        return {
            score: Math.round(totalScore),
            warnings,
            results
        };
    }

    buildDocumentStructure(template, processedData) {
        // Create a structured representation of the document
        const structure = {
            header: this.buildHeader(template, processedData),
            body: this.buildBody(template, processedData),
            footer: this.buildFooter(template, processedData)
        };

        return structure;
    }

    buildHeader(template, data) {
        switch (template.name) {
            case 'Standard Paystub':
                return {
                    companyName: data.employerName || 'Company Name',
                    documentTitle: 'PAYROLL STATEMENT',
                    payPeriod: data.payPeriod || 'Pay Period',
                    date: new Date().toLocaleDateString()
                };
            
            case 'Bank Statement':
                return {
                    bankName: data.bankName || 'Bank Name',
                    documentTitle: 'ACCOUNT STATEMENT',
                    accountNumber: this.maskAccountNumber(data.accountNumber),
                    statementPeriod: data.statementPeriod || 'Statement Period'
                };
            
            default:
                return {
                    documentTitle: template.name.toUpperCase(),
                    date: new Date().toLocaleDateString()
                };
        }
    }

    buildBody(template, data) {
        // Build the main content based on template type
        const body = {};

        template.fields.forEach(field => {
            if (data[field] !== undefined) {
                body[field] = data[field];
            }
        });

        return body;
    }

    buildFooter(template, data) {
        return {
            generatedBy: 'BuellDocs Professional Document Solutions',
            timestamp: new Date().toISOString(),
            documentId: this.generateDocumentId(template.name)
        };
    }

    applyFormatting(documentType, structure) {
        // Apply document-specific formatting rules
        const formatted = {
            ...structure,
            styles: this.getDocumentStyles(documentType),
            layout: this.getDocumentLayout(documentType)
        };

        return formatted;
    }

    getDocumentStyles(documentType) {
        const baseStyles = {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#000000'
        };

        const typeSpecificStyles = {
            paystub: {
                ...baseStyles,
                headerBackground: '#f0f0f0',
                borderColor: '#cccccc'
            },
            bankStatement: {
                ...baseStyles,
                headerBackground: '#e6f3ff',
                borderColor: '#0066cc'
            }
        };

        return typeSpecificStyles[documentType] || baseStyles;
    }

    getDocumentLayout(documentType) {
        return {
            pageSize: 'letter',
            margins: { top: 72, bottom: 72, left: 72, right: 72 },
            orientation: 'portrait'
        };
    }

    async renderDocument(formattedDocument) {
        // In a real implementation, this would generate a PDF or other format
        // For demo purposes, we'll return a structured representation
        
        return {
            format: 'html',
            content: this.generateHTMLContent(formattedDocument),
            downloadUrl: this.generateDownloadUrl(),
            previewUrl: this.generatePreviewUrl()
        };
    }

    generateHTMLContent(document) {
        // Generate HTML representation of the document
        return `
            <div class="document-container">
                <header class="document-header">
                    <h1>${document.header.documentTitle}</h1>
                    <div class="header-info">
                        ${Object.entries(document.header)
                            .filter(([key]) => key !== 'documentTitle')
                            .map(([key, value]) => `<p><strong>${this.formatFieldName(key)}:</strong> ${value}</p>`)
                            .join('')}
                    </div>
                </header>
                
                <main class="document-body">
                    ${Object.entries(document.body)
                        .map(([key, value]) => `
                            <div class="field-group">
                                <label>${this.formatFieldName(key)}:</label>
                                <span>${this.formatFieldValue(key, value)}</span>
                            </div>
                        `).join('')}
                </main>
                
                <footer class="document-footer">
                    <p>Generated by ${document.footer.generatedBy}</p>
                    <p>Document ID: ${document.footer.documentId}</p>
                    <p>Generated: ${new Date(document.footer.timestamp).toLocaleString()}</p>
                </footer>
            </div>
        `;
    }

    formatFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    formatFieldValue(fieldName, value) {
        if (fieldName.includes('Pay') || fieldName.includes('Tax') || fieldName.includes('Balance')) {
            return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
        }
        return value;
    }

    generateDocumentId(documentType) {
        const prefix = documentType.substring(0, 3).toUpperCase();
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    }

    generateDownloadUrl() {
        // In a real implementation, this would return a secure download URL
        return `#download-${Date.now()}`;
    }

    generatePreviewUrl() {
        // In a real implementation, this would return a preview URL
        return `#preview-${Date.now()}`;
    }

    getFederalTaxRate(grossPay, filingStatus) {
        // Simplified federal tax calculation
        const annualPay = this.annualizePay(grossPay, 'biweekly'); // Assume biweekly for calculation
        
        if (annualPay <= 10275) return 0.10;
        if (annualPay <= 41775) return 0.12;
        if (annualPay <= 89450) return 0.22;
        if (annualPay <= 190750) return 0.24;
        if (annualPay <= 364200) return 0.32;
        if (annualPay <= 462500) return 0.35;
        return 0.37;
    }

    annualizePay(grossPay, payPeriod) {
        const multipliers = {
            weekly: 52,
            biweekly: 26,
            monthly: 12,
            quarterly: 4,
            annually: 1
        };
        
        return grossPay * (multipliers[payPeriod] || 26);
    }

    maskAccountNumber(accountNumber) {
        if (!accountNumber) return '';
        const str = accountNumber.toString();
        if (str.length <= 4) return str;
        return '*'.repeat(str.length - 4) + str.slice(-4);
    }
}

// Initialize document generator
document.addEventListener('DOMContentLoaded', () => {
    window.documentGenerator = new DocumentGenerator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentGenerator;
}