// Dashboard management
class DashboardManager {
    constructor() {
        this.currentSection = 'overview';
        this.currentStep = 1;
        this.currentDocumentType = null;
        this.formData = {};
        this.documentGenerator = new DocumentGenerator();
    }

    init() {
        this.bindEvents();
        this.showSection('overview');
    }

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            if (window.buellDocsApp) {
                window.buellDocsApp.logout();
            }
        });

        document.querySelectorAll('.doc-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const docType = btn.dataset.type;
                this.startDocumentGeneration(docType);
            });
        });

        document.getElementById('nextStep')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep')?.addEventListener('click', () => this.prevStep());
        document.getElementById('backToDocuments')?.addEventListener('click', () => this.showSection('documents'));

        document.getElementById('docGenerationForm')?.addEventListener('submit', (e) => this.handleFormSubmission(e));

        document.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleHistoryAction(e));
        });

        document.querySelectorAll('.template-card .btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTemplateAction(e));
        });

        document.querySelectorAll('.settings-form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleSettingsUpdate(e));
        });

        document.getElementById('typeFilter')?.addEventListener('change', () => this.filterHistory());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.filterHistory());
    }

    showSection(sectionName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName)?.classList.add('active');

        this.currentSection = sectionName;
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'history':
                this.loadHistoryData();
                break;
            case 'templates':
                this.loadTemplatesData();
                break;
        }
    }

    loadOverviewData() {
        this.animateStats();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const isNumeric = !isNaN(parseFloat(finalValue));
            
            if (isNumeric) {
                const finalNum = parseFloat(finalValue);
                let currentNum = 0;
                const increment = finalNum / 50;
                const timer = setInterval(() => {
                    currentNum += increment;
                    if (currentNum >= finalNum) {
                        stat.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(currentNum).toString();
                    }
                }, 30);
            }
        });
    }

    startDocumentGeneration(docType) {
        this.currentDocumentType = docType;
        this.currentStep = 1;
        this.formData = {};

        const titles = {
            'paystub': 'Generate Paystub',
            'w2': 'Generate W-2 Form',
            'employment-letter': 'Generate Employment Letter',
            'bank-statement': 'Generate Bank Statement',
            'credit-report': 'Generate Credit Report',
            'utility-bill': 'Generate Utility Bill',
            'certification': 'Generate Certification',
            'transcript': 'Generate Transcript',
            'insurance': 'Generate Insurance Verification'
        };

        const descriptions = {
            'paystub': 'Create a professional paystub with accurate calculations and formatting.',
            'w2': 'Generate a complete W-2 tax form with all required information.',
            'employment-letter': 'Create an official employment verification letter.',
            'bank-statement': 'Generate a detailed bank statement with transaction history.',
            'credit-report': 'Create a comprehensive credit report with score details.',
            'utility-bill': 'Generate utility bills for various service providers.',
            'certification': 'Create professional certification documents.',
            'transcript': 'Generate academic transcripts with course details.',
            'insurance': 'Create insurance verification documents.'
        };

        document.getElementById('formTitle').textContent = titles[docType] || 'Generate Document';
        document.getElementById('formDescription').textContent = descriptions[docType] || 'Fill in the required information.';

        this.loadDynamicFields(docType);

        this.showSection('documentForm');
        this.updateFormProgress();
    }

    loadDynamicFields(docType) {
        const dynamicFields = document.getElementById('dynamicFields');
        let fieldsHTML = '';

        switch (docType) {
            case 'paystub':
                fieldsHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="employer">Employer Name</label>
                            <input type="text" id="employer" name="employerName" required>
                        </div>
                        <div class="form-group">
                            <label for="position">Position/Title</label>
                            <input type="text" id="position" name="position" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="payPeriod">Pay Period</label>
                            <select id="payPeriod" name="payPeriod" required>
                                <option value="">Select Pay Period</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="grossPay">Gross Pay</label>
                            <input type="number" id="grossPay" name="grossPay" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="federalTax">Federal Tax</label>
                            <input type="number" id="federalTax" name="federalTax" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="stateTax">State Tax</label>
                            <input type="number" id="stateTax" name="stateTax" step="0.01">
                        </div>
                    </div>
                `;
                break;

            case 'bank-statement':
                fieldsHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="bankName">Bank Name</label>
                            <input type="text" id="bankName" name="bankName" required>
                        </div>
                        <div class="form-group">
                            <label for="accountType">Account Type</label>
                            <select id="accountType" name="accountType" required>
                                <option value="">Select Account Type</option>
                                <option value="checking">Checking</option>
                                <option value="savings">Savings</option>
                                <option value="business">Business</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="accountNumber">Account Number</label>
                            <input type="text" id="accountNumber" name="accountNumber" required>
                        </div>
                        <div class="form-group">
                            <label for="routingNumber">Routing Number</label>
                            <input type="text" id="routingNumber" name="routingNumber" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="openingBalance">Opening Balance</label>
                            <input type="number" id="openingBalance" name="openingBalance" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="closingBalance">Closing Balance</label>
                            <input type="number" id="closingBalance" name="closingBalance" step="0.01" required>
                        </div>
                    </div>
                `;
                break;

            default:
                fieldsHTML = `
                    <div class="form-group">
                        <label for="additionalInfo">Additional Information</label>
                        <textarea id="additionalInfo" name="additionalInfo" rows="4" placeholder="Enter any additional details for your document..."></textarea>
                    </div>
                `;
        }

        dynamicFields.innerHTML = fieldsHTML;
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.updateFormProgress();
            this.showCurrentStep();

            if (this.currentStep === 3) {
                this.generatePreview();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateFormProgress();
            this.showCurrentStep();
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff6363';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) {
            window.buellDocsApp?.showMessage('Please fill in all required fields.', 'error');
        }

        return isValid;
    }

    saveCurrentStepData() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.name) {
                this.formData[input.name] = input.value;
            }
        });
    }

    updateFormProgress() {
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`.progress-step[data-step="${this.currentStep}"]`)?.classList.add('active');

        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const generateBtn = document.getElementById('generateDoc');

        if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentStep === 3 ? 'none' : 'block';
        if (generateBtn) generateBtn.style.display = this.currentStep === 3 ? 'block' : 'none';
    }

    showCurrentStep() {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`.form-step[data-step="${this.currentStep}"]`)?.classList.add('active');
    }

    async generatePreview() {
        document.getElementById('reviewDocType').textContent = this.getDocumentTypeName(this.currentDocumentType);
        document.getElementById('reviewName').textContent = this.formData.fullName || '';
        document.getElementById('reviewAddress').textContent = 
            `${this.formData.address || ''}, ${this.formData.city || ''}, ${this.formData.state || ''} ${this.formData.zipCode || ''}`;

        const previewFrame = document.querySelector('.document-preview-frame');
        previewFrame.innerHTML = `
            <div class="preview-loading">
                <div class="loading-spinner"></div>
                <p>Generating preview...</p>
            </div>
        `;

        try {
            const documentData = await this.documentGenerator.generateDocument(this.currentDocumentType, this.formData);
            if (documentData.success) {
                previewFrame.innerHTML = `
                    <div class="document-preview-content">
                        ${documentData.document.content}
                    </div>
                `;
            } else {
                previewFrame.innerHTML = `<p class="text-muted">Failed to generate preview: ${documentData.error}</p>`;
            }
        } catch (error) {
            previewFrame.innerHTML = `<p class="text-muted">Error generating preview: ${error.message}</p>`;
        }
    }

    getDocumentTypeName(type) {
        const names = {
            'paystub': 'Paystub',
            'w2': 'W-2 Form',
            'employment-letter': 'Employment Letter',
            'bank-statement': 'Bank Statement',
            'credit-report': 'Credit Report',
            'utility-bill': 'Utility Bill',
            'certification': 'Professional Certification',
            'transcript': 'Academic Transcript',
            'insurance': 'Insurance Verification'
        };
        return names[type] || 'Document';
    }

    async handleFormSubmission(e) {
        e.preventDefault();
        
        const generateBtn = document.getElementById('generateDoc');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = 'Generating Document...';
        generateBtn.disabled = true;

        try {
            const documentData = await this.documentGenerator.generateDocument(this.currentDocumentType, this.formData);
            
            if (documentData.success) {
                this.addToHistory(documentData.metadata);
                window.buellDocsApp?.showMessage('Document generated successfully!', 'success');
                this.showSection('history');
            } else {
                window.buellDocsApp?.showMessage('Failed to generate document: ' + documentData.error, 'error');
            }
        } catch (error) {
            window.buellDocsApp?.showMessage('Failed to generate document. Please try again.', 'error');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }

    addToHistory(metadata) {
        const historyList = document.querySelector('.history-list');
        const newItem = document.createElement('div');
        newItem.className = 'history-item';
        
        const docIcon = this.getDocumentIcon(metadata.documentType);
        const docName = this.getDocumentTypeName(metadata.documentType);
        const timestamp = new Date(metadata.generatedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        newItem.innerHTML = `
            <div class="history-icon">${docIcon}</div>
            <div class="history-details">
                <span class="history-title">${docName} - ${this.formData.fullName || 'Document'}</span>
                <span class="history-date">Generated on ${timestamp}</span>
                <span class="history-id">ID: ${metadata.documentId}</span>
            </div>
            <div class="history-actions">
                <a href="${metadata.downloadUrl}" class="btn-icon" title="Download" data-action="download" download>📥</a>
                <a href="${metadata.previewUrl}" target="_blank" class="btn-icon" title="View" data-action="view">👁️</a>
                <button class="btn-icon" title="Duplicate" data-action="duplicate">📋</button>
            </div>
        `;

        historyList.insertBefore(newItem, historyList.firstChild);
        
        newItem.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleHistoryAction(e));
        });
    }

    getDocumentIcon(type) {
        const icons = {
            'paystub': '📊',
            'w2': '📋',
            'employment-letter': '📝',
            'bank-statement': '🏦',
            'credit-report': '📈',
            'utility-bill': '⚡',
            'certification': '🏆',
            'transcript': '🎓',
            'insurance': '🛡️'
        };
        return icons[type] || '📄';
    }

    handleHistoryAction(e) {
        const action = e.target.dataset.action;
        const historyItem = e.target.closest('.history-item');
        const docTitle = historyItem.querySelector('.history-title').textContent;

        switch (action) {
            case 'download':
                window.buellDocsApp?.showMessage(`Downloading: ${docTitle}`, 'info');
                break;
            case 'view':
                window.buellDocsApp?.showMessage(`Opening: ${docTitle}`, 'info');
                break;
            case 'duplicate':
                window.buellDocsApp?.showMessage(`Duplicating: ${docTitle}`, 'info');
                break;
        }
    }

    handleTemplateAction(e) {
        const templateCard = e.target.closest('.template-card');
        const templateName = templateCard.querySelector('h3').textContent;
        
        if (templateCard.classList.contains('new-template')) {
            window.buellDocsApp?.showMessage('Template creation feature coming soon!', 'info');
        } else {
            window.buellDocsApp?.showMessage(`Using template: ${templateName}`, 'info');
        }
    }

    handleSettingsUpdate(e) {
        e.preventDefault();
        const formType = e.target.closest('.settings-card').querySelector('h3').textContent;
        
        window.buellDocsApp?.showMessage(`${formType} updated successfully!`, 'success');
    }

    filterHistory() {
        const typeFilter = document.getElementById('typeFilter')?.value;
        const dateFilter = document.getElementById('dateFilter')?.value;
        
        window.buellDocsApp?.showMessage('Filters applied to history', 'info');
    }

    loadHistoryData() {
        console.log('Loading history data...');
    }

    loadTemplatesData() {
        console.log('Loading templates data...');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
const style = document.createElement('style');
style.textContent = `
    .document-preview-content {
        padding: var(--spacing-lg);
        text-align: left;
        width: 100%;
    }
    
    .preview-header {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }
    
    .preview-header h4 {
        color: var(--accent-gold);
        margin-bottom: var(--spacing-xs);
    }
    
    .preview-header p {
        color: var(--text-muted);
        font-size: 0.875rem;
    }
    
    .preview-body p {
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
    }
    
    .preview-placeholder {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-xl);
        margin-top: var(--spacing-lg);
        text-align: center;
    }
    
    .preview-placeholder p {
        color: var(--text-muted);
        margin-bottom: var(--spacing-sm);
    }
`;
document.head.appendChild(style);
