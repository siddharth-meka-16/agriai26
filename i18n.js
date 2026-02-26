// ================= AGUARD AI SMART - INTERNATIONALIZATION SYSTEM =================

(function() {
    'use strict';

    const i18n = {
        currentLang: localStorage.getItem('language') || 'en',
        
        translations: {
            en: {
                // Navigation
                'nav.features': 'Features',
                'nav.howItWorks': 'How It Works',
                'nav.about': 'About',
                'nav.dashboard': 'Dashboard',
                'nav.newClaim': 'New Claim',
                'nav.myClaims': 'My Claims',
                'nav.allClaims': 'All Claims',
                'nav.highRisk': 'High Risk',
                'nav.logout': 'Logout',
                
                // Hero Section
                'hero.title': 'AI-Powered Agricultural Insurance',
                'hero.subtitle': 'Smart claim validation, advanced compensation modeling, and instant payouts for farmers. Trusted by thousands across the country.',
                
                // Role Cards
                'role.farmer.title': 'Farmer',
                'role.farmer.desc': 'Submit claims, track status, and receive payouts directly to your bank account',
                'role.officer.title': 'Insurance Officer',
                'role.officer.desc': 'Review claims, manage verifications, and track payouts in your region',
                'role.government.title': 'Government',
                'role.government.desc': 'View analytics, monitor fraud trends, and track national agricultural stats',
                
                // Dashboard
                'dashboard.farmer.title': 'Farmer Dashboard',
                'dashboard.farmer.subtitle': 'Welcome! Submit and track your insurance claims',
                'dashboard.officer.title': 'Insurance Officer Dashboard',
                'dashboard.officer.subtitle': 'Manage and review claims in your jurisdiction',
                'dashboard.government.title': 'Government Dashboard',
                'dashboard.government.subtitle': 'National agricultural insurance analytics and insights',
                
                // Buttons
                'btn.newClaim': 'New Claim',
                'btn.refresh': 'Refresh',
                'btn.refreshData': 'Refresh Data',
                'btn.exportCsv': 'Export CSV',
                'btn.exportReport': 'Export Report',
                'btn.submitClaim': 'Submit Claim',
                'btn.clearForm': 'Clear Form',
                'btn.view': 'View',
                'btn.back': 'Back',
                
                // Tabs
                'tab.submitClaim': 'Submit Claim',
                'tab.myClaims': 'My Claims',
                'tab.claimDetails': 'Claim Details',
                'tab.dashboard': 'Dashboard',
                'tab.claims': 'All Claims',
                'tab.highRisk': 'High Risk',
                
                // Table Headers
                'table.claimId': 'Claim ID',
                'table.date': 'Date',
                'table.crop': 'Crop',
                'table.land': 'Land',
                'table.damage': 'Damage %',
                'table.status': 'Status',
                'table.payout': 'Payout',
                'table.actions': 'Actions',
                'table.farmer': 'Farmer',
                'table.region': 'Region',
                'table.aiScore': 'AI Score',
                'table.fraudRisk': 'Fraud Risk',
                
                // Status Labels
                'status.pending': 'Pending',
                'status.approved': 'Approved',
                'status.rejected': 'Rejected',
                'status.review': 'Under Review',
                
                // Form Labels
                'form.cropType': 'Crop Type',
                'form.landSize': 'Land Size (acres)',
                'form.coverage': 'Policy Coverage (%)',
                'form.damageDate': 'Date of Damage',
                'form.farmLocation': 'Farm Location',
                'form.detectLocation': 'Detect My Location',
                'form.selectRegion': 'Select district/region',
                'form.description': 'Damage Description',
                'form.farmerName': 'Full Name',
                'form.farmerId': 'Farmer ID',
                'form.submitForAi': 'Submit for AI Analysis',
                'form.dropImages': 'Drop images here or click to upload',
                'form.uploadHint': 'Upload clear photos of crop damage (JPG, PNG)',
                
                // Empty States
                'empty.noClaims': 'No claims found',
                'empty.noClaimsDesc': "You haven't submitted any claims yet.",
                'empty.submitFirst': 'Submit Your First Claim',
                'empty.noResults': 'No claims match your current filters.',
                'empty.noHighRisk': 'All claims are within acceptable risk levels.',
                
                // Footer
                'footer.copyright': '© 2026 AgriGuard AI Smart. All rights reserved.',
                'footer.tagline': 'Empowering Farmers with AI Technology',
                
                // Language
                'lang.select': 'Language',
                'lang.en': 'English',
                'lang.hi': 'हिन्दी',
                'lang.te': 'తెలుగు'
            },
            
            hi: {
                // Navigation
                'nav.features': 'विशेषताएँ',
                'nav.howItWorks': 'कैसे काम करता है',
                'nav.about': 'हमारे बारे में',
                'nav.dashboard': 'डैशबोर्ड',
                'nav.newClaim': 'नया दावा',
                'nav.myClaims': 'मेरे दावे',
                'nav.allClaims': 'सभी दावे',
                'nav.highRisk': 'उच्च जोखिम',
                'nav.logout': 'लॉगआउट',
                
                // Hero Section
                'hero.title': 'एआई संचालित कृषि बीमा',
                'hero.subtitle': 'स्मार्ट दावा सत्यापन, उन्नत मुआवजा मॉडलिंग और किसानों के लिए तुरंत भुगतान। देशभर में हजारों किसानों द्वारा भरोसा किया गया।',
                
                // Role Cards
                'role.farmer.title': 'किसान',
                'role.farmer.desc': 'दावा जमा करें, स्थिति ट्रैक करें और सीधे अपने बैंक खाते में भुगतान प्राप्त करें',
                'role.officer.title': 'बीमा अधिकारी',
                'role.officer.desc': 'दावों की समीक्षा करें, सत्यापन प्रबंधित करें और अपने क्षेत्र में भुगतान ट्रैक करें',
                'role.government.title': 'सरकार',
                'role.government.desc': 'विश्लेषण देखें, धोखाधड़ी रुझानों की निगरानी करें और राष्ट्रीय कृषि आँकड़े ट्रैक करें',
                
                // Dashboard
                'dashboard.farmer.title': 'किसान डैशबोर्ड',
                'dashboard.farmer.subtitle': 'स्वागत है! अपने बीमा दावे जमा करें और ट्रैक करें',
                'dashboard.officer.title': 'बीमा अधिकारी डैशबोर्ड',
                'dashboard.officer.subtitle': 'अपने क्षेत्र में दावों की समीक्षा और प्रबंधन करें',
                'dashboard.government.title': 'सरकारी डैशबोर्ड',
                'dashboard.government.subtitle': 'राष्ट्रीय कृषि बीमा विश्लेषण और अंतर्दृष्टि',
                
                // Buttons
                'btn.newClaim': 'नया दावा',
                'btn.refresh': 'रिफ्रेश',
                'btn.refreshData': 'डेटा रिफ्रेश',
                'btn.exportCsv': 'CSV निर्यात करें',
                'btn.exportReport': 'रिपोर्ट निर्यात करें',
                'btn.submitClaim': 'दावा जमा करें',
                'btn.clearForm': 'फॉर्म साफ़ करें',
                'btn.view': 'देखें',
                'btn.back': 'वापस',
                
                // Tabs
                'tab.submitClaim': 'दावा जमा करें',
                'tab.myClaims': 'मेरे दावे',
                'tab.claimDetails': 'दावा विवरण',
                'tab.dashboard': 'डैशबोर्ड',
                'tab.claims': 'सभी दावे',
                'tab.highRisk': 'उच्च जोखिम',
                
                // Table Headers
                'table.claimId': 'दावा ID',
                'table.date': 'तारीख',
                'table.crop': 'फसल',
                'table.land': 'जमीन',
                'table.damage': 'नुकसान %',
                'table.status': 'स्थिति',
                'table.payout': 'भुगतान',
                'table.actions': 'कार्य',
                'table.farmer': 'किसान',
                'table.region': 'क्षेत्र',
                'table.aiScore': 'AI स्कोर',
                'table.fraudRisk': 'धोखाधड़ी जोखिम',
                
                // Status Labels
                'status.pending': 'लंबित',
                'status.approved': 'स्वीकृत',
                'status.rejected': 'अस्वीकृत',
                'status.review': 'समीक्षाधीन',
                
                // Form Labels
                'form.cropType': 'फसल का प्रकार',
                'form.landSize': 'जमीन का आकार (एकड़)',
                'form.coverage': 'पॉलिसी कवरेज (%)',
                'form.damageDate': 'नुकसान की तारीख',
                'form.farmLocation': 'खेत का स्थान',
                'form.detectLocation': 'मेरा स्थान पता करें',
                'form.selectRegion': 'जिला/क्षेत्र चुनें',
                'form.description': 'नुकसान का विवरण',
                'form.farmerName': 'पूरा नाम',
                'form.farmerId': 'किसान ID',
                'form.submitForAi': 'AI विश्लेषण के लिए जमा करें',
                'form.dropImages': 'यहाँ छवियाँ छोड़ें या अपलोड करने के लिए क्लिक करें',
                'form.uploadHint': 'फसल की क्षति की स्पष्ट तस्वीरें अपलोड करें (JPG, PNG)',
                
                // Empty States
                'empty.noClaims': 'कोई दावा नहीं मिला',
                'empty.noClaimsDesc': 'आपने अभी तक कोई दावा जमा नहीं किया है।',
                'empty.submitFirst': 'अपना पहला दावा जमा करें',
                'empty.noResults': 'आपके वर्तमान फ़िल्टर से कोई दावा मेल नहीं खाता।',
                'empty.noHighRisk': 'सभी दावे स्वीकार्य जोखिम स्तर के भीतर हैं।',
                
                // Footer
                'footer.copyright': '© 2026 AgriGuard AI Smart. सर्वाधिकार सुरक्षित।',
                'footer.tagline': 'AI तकनीक से किसानों को सशक्त बनाना',
                
                // Language
                'lang.select': 'भाषा',
                'lang.en': 'English',
                'lang.hi': 'हिन्दी',
                'lang.te': 'తెలుగు'
            },
            
            te: {
                // Navigation
                'nav.features': 'లక్షణాలు',
                'nav.howItWorks': 'ఇది ఎలా పనిచేస్తుంది',
                'nav.about': 'గురుంచి',
                'nav.dashboard': 'Dashboard',
                'nav.newClaim': 'క్రొత¢ claim',
                'nav.myClaims': 'my claims',
                'nav.allClaims': 'All Claims',
                'nav.highRisk': 'High Risk',
                'nav.logout': 'Logout',
                
                // Hero Section
                'hero.title': 'AI-శక్తితో కృషి బీమా',
                'hero.subtitle': 'smart claim verification, advanced compensation modeling, and instant payouts for farmers. Thousands trust us across the country.',
                
                // Role Cards
                'role.farmer.title': 'रైతు',
                'role.farmer.desc': 'claims submit చెయ్యండి, status ట్రాక్ చెయ్యండి, direct bank account lo payouts receiving',
                'role.officer.title': 'బीमा officer',
                'role.officer.desc': 'claims review చెయ్యండйте, verifications manage చె�్యండйте, region lo payouts track',
                'role.government.title': 'Government',
                'role.government.desc': 'analytics view చె�్యండйте, fraud trends monitor, national agricultural stats track',
                
                // Dashboard
                'dashboard.farmer.title': 'Rajya Dashboard',
                'dashboard.farmer.subtitle': 'Welcome! Insurance claims submit and track',
                'dashboard.officer.title': 'Insurance Officer Dashboard',
                'dashboard.officer.subtitle': 'Manage and review claims in jurisdiction',
                'dashboard.government.title': 'Government Dashboard',
                'dashboard.government.subtitle': 'National agricultural insurance analytics',
                
                // Buttons
                'btn.newClaim': 'New Claim',
                'btn.refresh': 'Refresh',
                'btn.refreshData': 'Refresh Data',
                'btn.exportCsv': 'Export CSV',
                'btn.exportReport': 'Export Report',
                'btn.submitClaim': 'Submit Claim',
                'btn.clearForm': 'Clear Form',
                'btn.view': 'View',
                'btn.back': 'Back',
                
                // Tabs
                'tab.submitClaim': 'Submit Claim',
                'tab.myClaims': 'My Claims',
                'tab.claimDetails': 'Claim Details',
                'tab.dashboard': 'Dashboard',
                'tab.claims': 'All Claims',
                'tab.highRisk': 'High Risk',
                
                // Table Headers
                'table.claimId': 'Claim ID',
                'table.date': 'Date',
                'table.crop': 'Crop',
                'table.land': 'Land',
                'table.damage': 'Damage %',
                'table.status': 'Status',
                'table.payout': 'Payout',
                'table.actions': 'Actions',
                'table.farmer': 'Farmer',
                'table.region': 'Region',
                'table.aiScore': 'AI Score',
                'table.fraudRisk': 'Fraud Risk',
                
                // Status Labels
                'status.pending': 'Pending',
                'status.approved': 'Approved',
                'status.rejected': 'Rejected',
                'status.review': 'Under Review',
                
                // Form Labels
                'form.cropType': 'Crop Type',
                'form.landSize': 'Land Size (acres)',
                'form.coverage': 'Policy Coverage (%)',
                'form.damageDate': 'Date of Damage',
                'form.farmLocation': 'Farm Location',
                'form.detectLocation': 'Detect Location',
                'form.selectRegion': 'Select Region',
                'form.description': 'Description',
                'form.farmerName': 'Full Name',
                'form.farmerId': 'Farmer ID',
                'form.submitForAi': 'Submit for AI',
                'form.dropImages': 'Drop images',
                'form.uploadHint': 'Upload photos',
                
                // Empty States
                'empty.noClaims': 'No claims',
                'empty.noClaimsDesc': 'No claims submitted yet',
                'empty.submitFirst': 'Submit First Claim',
                'empty.noResults': 'No matching claims',
                'empty.noHighRisk': 'No high risk claims',
                
                // Footer
                'footer.copyright': '© 2026 AgriGuard AI Smart. All rights reserved.',
                'footer.tagline': 'Empowering Farmers with AI',
                
                // Language
                'lang.select': 'Language',
                'lang.en': 'English',
                'lang.hi': 'हिन्दी',
                'lang.te': 'తెలుగు'
            }
        },

        t: function(key) {
            const lang = this.translations[this.currentLang];
            return lang && lang[key] ? lang[key] : (this.translations.en[key] || key);
        },

        setLanguage: function(lang) {
            if (this.translations[lang]) {
                this.currentLang = lang;
                localStorage.setItem('language', lang);
                this.applyTranslations();
                this.updateLangLabel();
            }
        },

        getCurrentLang: function() {
            return this.currentLang;
        },

        updateLangLabel: function() {
            const label = document.getElementById('lang-current');
            if (label) {
                const labels = {
                    en: 'English',
                    hi: 'हिन्दी',
                    te: 'తెలుగు'
                };
                label.textContent = labels[this.currentLang] || 'English';
            }
        },

        applyTranslations: function() {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = this.t(key);
                if (translation) {
                    el.textContent = translation;
                }
            });

            const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
            placeholders.forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const translation = this.t(key);
                if (translation) {
                    el.placeholder = translation;
                }
            });
        },

        init: function() {
            this.currentLang = localStorage.getItem('language') || 'en';
            this.applyTranslations();
            this.setupDropdown();
        },

        setupDropdown: function() {
            const _this = this;
            
            const langBtn = document.getElementById('lang-toggle');
            const dropdown = document.getElementById('lang-dropdown');
            
            if (langBtn && dropdown) {
                langBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle('show');
                });

                document.addEventListener('click', function() {
                    dropdown.classList.remove('show');
                });

                dropdown.addEventListener('click', function(e) {
                    e.stopPropagation();
                });

                const options = dropdown.querySelectorAll('[data-lang]');
                options.forEach(option => {
                    option.addEventListener('click', function(e) {
                        e.preventDefault();
                        const lang = this.getAttribute('data-lang');
                        _this.setLanguage(lang);
                        dropdown.classList.remove('show');
                    });
                });
            }

            this.updateLangLabel();
        }
    };

    window.i18n = i18n;

    window.applyLanguage = function(lang) {
        i18n.setLanguage(lang);
    };

    window.initLanguage = function() {
        i18n.init();
    };

})();
