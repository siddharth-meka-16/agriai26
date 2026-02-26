const Chatbot = (function() {
    'use strict';

    let isOpen = false;
    let messages = [];
    let currentContext = null;
    let isListening = false;
    let speechSynthesisSupported = false;
    let speechRecognitionSupported = false;
    let autoSpeakEnabled = true;

    const FAQ_DATA = {
        farmer: [
            {
                keywords: ['claim', 'submit', 'file', 'new claim', 'how to claim', 'apply'],
                context: 'claim',
                response: `To submit a claim:
1. Click "New Claim" in your dashboard
2. Select crop type and land size
3. Add a brief description of damage
4. Upload photos (optional but recommended)
5. Our AI will analyze and give you instant decision!`
            },
            {
                keywords: ['status', 'track', 'check', 'my claim', 'claim status', 'pending'],
                context: 'status',
                response: `Check your claim status in "My Claims" tab:
• Pending - Being processed
• Under Review - Need more verification
• Approved - Payment coming soon!
• Rejected - Check reasons in claim details`
            },
            {
                keywords: ['payout', 'payment', 'money', 'receive', 'disbursement', 'bank', 'when'],
                context: 'payout',
                response: `Once approved, payment to your bank in 2-3 days!
Calculation: Base Rate × Land × Damage % × Coverage %
High-risk zones get 15% extra relief fund.`
            },
            {
                keywords: ['fraud', 'fake', 'scam', 'risk', 'suspicious', 'rejected'],
                context: 'fraud',
                response: `Our AI checks:
• Claim history patterns
• Photo authenticity
• Location consistency
• Weather matching
Legitimate claims are approved quickly!`
            },
            {
                keywords: ['weather', 'rain', 'drought', 'flood', 'climate', 'storm'],
                context: 'weather',
                response: `We verify damage with local weather data:
• Drought conditions
• Flooding
• Heavy rain
• Storms
Weather matching strengthens your claim!`
            },
            {
                keywords: ['crop', 'wheat', 'rice', 'cotton', 'corn', 'soybean', 'sugarcane'],
                context: 'crop',
                response: `Covered crops with base rates:
• Wheat: ₹20,000/acre
• Rice: ₹25,000/acre
• Cotton: ₹30,000/acre
• Corn: ₹18,000/acre
• Soybean: ₹22,000/acre
• Sugarcane: ₹28,000/acre`
            },
            {
                keywords: ['document', 'required', 'need', 'upload', 'image', 'photo'],
                context: 'documents',
                response: `Required for claims:
• Crop type and land size
• Description of damage
• Optional: Photos help accuracy!
More images = better AI assessment!`
            },
            {
                keywords: ['approve', 'approved', 'accept', 'success', 'eligible'],
                context: 'approved',
                response: `Claims approved when AI score ≥75!
Factors: Damage severity, weather match, trust score.
Approved claims paid in 2-3 business days.`
            },
            {
                keywords: ['reject', 'rejected', 'denied', 'fail', 'why not'],
                context: 'rejected',
                response: `Claims rejected if:
• AI score below 50
• Damage less than 10%
• High fraud risk detected
You can resubmit with more evidence!`
            },
            {
                keywords: ['review', 'pending', 'waiting', 'manual'],
                context: 'review',
                response: `Claims with score 50-75 need manual review.
An officer will verify your claim.
You'll be notified when complete!`
            },
            {
                keywords: ['coverage', 'policy', 'insurance', 'percent', 'percentage', 'choose'],
                context: 'coverage',
                response: `Choose coverage 30-100%:
• Higher coverage = higher premium
• Higher coverage = more compensation
• Default is 70%
Formula: Base × Damage% × Coverage%`
            },
            {
                keywords: ['help', 'support', 'contact', 'customer'],
                context: 'help',
                response: `Need help?
• Call: 1800-AGRIGUARD
• Email: support@agriguard.ai
• Or ask me anything!`
            }
        ],
        officer: [
            {
                keywords: ['claim', 'claims', 'view', 'all claims', 'list'],
                context: 'claims',
                response: `Officer Dashboard shows:
• All claims in your jurisdiction
• Filter by status, region, fraud risk
• Search by ID or farmer name
• View detailed AI analysis`
            },
            {
                keywords: ['approve', 'approved', 'accept', 'review', 'decision'],
                context: 'approve',
                response: `Override AI decisions:
• Review claim details
• Check AI scoring breakdown
• Approve or reject with reasons
Your decision is final!`
            },
            {
                keywords: ['fraud', 'risk', 'suspicious', 'high risk', 'flag'],
                context: 'fraud',
                response: `High-risk claims flagged when:
• Fraud risk >60%
• Unusual patterns detected
• Weather mismatch
Review these carefully!`
            },
            {
                keywords: ['export', 'csv', 'report', 'download'],
                context: 'export',
                response: `Export claims data:
• Click "Export CSV" button
• Filtered data included
• Includes all claim fields
Perfect for reports!`
            },
            {
                keywords: ['region', 'district', 'area', 'jurisdiction'],
                context: 'region',
                response: `View claims by region:
• North/South/East/West District
• Central District
• Coastal Region
• Hill Region
• Plain Region`
            },
            {
                keywords: ['statistics', 'stats', 'numbers', 'metrics'],
                context: 'stats',
                response: `Dashboard shows:
• Total/Approved/Pending counts
• High risk claim count
• Processing efficiency
All real-time!`
            }
        ],
        government: [
            {
                keywords: ['claim', 'claims', 'total', 'number'],
                context: 'claims',
                response: `National claims overview:
• Total claims submitted
• Approved vs Rejected ratios
• Claims by region
All updating in real-time!`
            },
            {
                keywords: ['fraud', 'risk', 'suspicious', 'high risk', 'trend'],
                context: 'fraud',
                response: `Fraud monitoring:
• High-risk zone detection
• Fraud trend analysis chart
• Regional risk assessment
AI flags suspicious patterns!`
            },
            {
                keywords: ['payout', 'payment', 'money', 'total', 'disbursement'],
                context: 'payout',
                response: `Payout analytics:
• Total payout amount
• Average payout per claim
• Payout by crop type
• Regional distribution`
            },
            {
                keywords: ['region', 'district', 'state', 'zone', 'area'],
                context: 'region',
                response: `Regional analysis:
• Claims by region (bar chart)
• Top performing districts
• High-risk zones identified
• Comparative analysis`
            },
            {
                keywords: ['export', 'report', 'csv', 'download'],
                context: 'export',
                response: `Export government reports:
• Click "Export Report"
• Claims and transactions
• Regional breakdowns
For official use!`
            },
            {
                keywords: ['crop', 'wheat', 'rice', 'cotton', 'corn'],
                context: 'crop',
                response: `Crop-wise distribution:
• Claims by crop type
• Payout by crop (pie chart)
• Damage patterns
• Risk assessment per crop`
            }
        ],
        common: [
            {
                keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
                context: 'greeting',
                response: 'greeting'
            },
            {
                keywords: ['thank', 'thanks', 'appreciate', 'grateful'],
                context: 'thanks',
                response: 'thanks'
            },
            {
                keywords: ['bye', 'goodbye', 'see you', 'later', 'take care'],
                context: 'goodbye',
                response: 'goodbye'
            },
            {
                keywords: ['who', 'what', 'you', 'are you'],
                context: 'about',
                response: `I'm AgriGuard AI Assistant!
I help farmers, officers, and government users with:
• Claim submissions and status
• Payout calculations
• Fraud detection info
• Policy questions
How can I help you today?`
            },
            {
                keywords: ['how', 'work', 'system', 'process'],
                context: 'how',
                response: `AgriGuard AI Process:
1. Submit claim with details
2. AI analyzes images & data
3. Weather verification
4. Fraud risk assessment
5. Instant decision!
Simple and fast!`
            }
        ]
    };

    const GREETING_RESPONSES = {
        farmer: [
            "Hello farmer! 🌾 I can help you with claims, payouts, and more. What would you like to know?",
            "Hi! I'm here to help with your crop insurance claims. Ask me anything!",
            "Welcome! I can guide you through claim submission, status checks, or payout questions."
        ],
        officer: [
            "Hello officer! 👔 I can help you review claims and manage your dashboard. What do you need?",
            "Hi! I'm here to assist with claim review and fraud detection. How can I help?",
            "Welcome! I can help you with claims analysis, filtering, and decisions."
        ],
        government: [
            "Hello official! 🏛️ I can help you with national analytics and fraud monitoring. What info do you need?",
            "Hi! I'm here to help with government dashboard and reports. Ask away!",
            "Welcome! I can assist with national agricultural statistics and insights."
        ],
        default: [
            "Hello! I'm AgriGuard Assistant. How can I help you today?",
            "Hi there! I can help with claims, payments, or general questions.",
            "Welcome! Ask me anything about AgriGuard!"
        ]
    };

    const FALLBACK_RESPONSES = [
        "I can help with claims, payouts, fraud detection, or policy questions. Could you try a different way of asking?",
        "That's a great question! I'm best at helping with claim status, payments, or understanding how our AI works.",
        "I'm not sure about that, but I'm happy to help with claims, payouts, fraud checks, or any AgriGuard questions!"
    ];

    function getCurrentUserRole() {
        try {
            const user = localStorage.getItem('currentUser');
            if (user) {
                const parsed = JSON.parse(user);
                return parsed.role || 'farmer';
            }
        } catch (e) {}
        return 'farmer';
    }

    function init() {
        checkBrowserSupport();
        
        const toggle = document.getElementById('chatbot-toggle');
        const panel = document.getElementById('chatbot-panel');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input-field');
        const send = document.getElementById('chatbot-send');
        const micBtn = document.getElementById('chatbot-mic');

        if (!toggle || !panel) return;

        if (!toggle.hasAttribute('data-listener-added')) {
            toggle.addEventListener('click', toggleChat);
            toggle.setAttribute('data-listener-added', 'true');
        }
        
        if (close && !close.hasAttribute('data-listener-added')) {
            close.addEventListener('click', toggleChat);
            close.setAttribute('data-listener-added', 'true');
        }
        
        if (send && !send.hasAttribute('data-listener-added')) {
            send.addEventListener('click', handleSend);
            send.setAttribute('data-listener-added', 'true');
        }
        
        if (input && !input.hasAttribute('data-listener-added')) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSend();
            });
            input.setAttribute('data-listener-added', 'true');
        }

        if (micBtn && !micBtn.hasAttribute('data-listener-added')) {
            micBtn.addEventListener('click', toggleVoiceInput);
            micBtn.setAttribute('data-listener-added', 'true');
        }
    }

    function checkBrowserSupport() {
        speechSynthesisSupported = 'speechSynthesis' in window;
        speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        const micBtn = document.getElementById('chatbot-mic');
        if (micBtn) {
            if (!speechRecognitionSupported) {
                micBtn.style.display = 'none';
            }
        }
    }

    function toggleChat() {
        isOpen = !isOpen;
        const panel = document.getElementById('chatbot-panel');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (panel) {
            if (isOpen) {
                panel.classList.remove('hidden');
                panel.style.display = 'flex';
            } else {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            }
        }
        
        if (toggle) {
            toggle.innerHTML = isOpen ? '✕' : '💬';
        }

        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                addBotMessage(getGreeting());
            }, 500);
        }
    }

    function handleSend() {
        const input = document.getElementById('chatbot-input-field');
        const message = input?.value?.trim();
        
        if (!message) return;

        addUserMessage(message);
        input.value = '';

        showTypingIndicator();
        
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateResponse(message);
            addBotMessage(response);
            
            if (autoSpeakEnabled && speechSynthesisSupported) {
                speakText(response);
            }
        }, 800 + Math.random() * 400);
    }

    function generateResponse(userMessage) {
        const role = getCurrentUserRole();
        const lowerMessage = userMessage.toLowerCase();
        
        const roleFAQs = FAQ_DATA[role] || FAQ_DATA.farmer;
        
        for (const faq of roleFAQs) {
            for (const keyword of faq.keywords) {
                if (lowerMessage.includes(keyword)) {
                    currentContext = faq.context;
                    
                    if (faq.response === 'greeting') return getGreeting();
                    if (faq.response === 'thanks') return "You're welcome! Happy to help. Anything else?";
                    if (faq.response === 'goodbye') return "Goodbye! Best of luck with your crops!";
                    
                    return faq.response;
                }
            }
        }

        for (const faq of FAQ_DATA.common) {
            for (const keyword of faq.keywords) {
                if (lowerMessage.includes(keyword)) {
                    if (faq.response === 'greeting') return getGreeting();
                    if (faq.response === 'thanks') return "You're welcome! Anything else I can help with?";
                    if (faq.response === 'goodbye') return "Goodbye! Come back anytime!";
                    return faq.response;
                }
            }
        }

        return getFallbackResponse();
    }

    function getGreeting() {
        const role = getCurrentUserRole();
        const greetings = GREETING_RESPONSES[role] || GREETING_RESPONSES.default;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    function getFallbackResponse() {
        return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }

    function addUserMessage(text) {
        messages.push({ role: 'user', text });
        addMessageToUI(text, 'user');
    }

    function addBotMessage(text) {
        messages.push({ role: 'bot', text });
        addMessageToUI(text, 'bot');
    }

    function addMessageToUI(text, role) {
        const container = document.getElementById('chatbot-messages');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${role}`;
        messageDiv.innerHTML = `
            <div class="chat-message-content">
                ${formatMessage(text)}
            </div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    function formatMessage(text) {
        return text.replace(/\n/g, '<br>');
    }

    function showTypingIndicator() {
        const container = document.getElementById('chatbot-messages');
        if (!container) return;

        const indicator = document.createElement('div');
        indicator.className = 'chat-message chat-message-bot typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="chat-message-content">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;

        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function toggleVoiceInput() {
        if (!speechRecognitionSupported) {
            alert('Voice input not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        const micBtn = document.getElementById('chatbot-mic');

        if (isListening) {
            recognition.stop();
            isListening = false;
            if (micBtn) {
                micBtn.classList.remove('listening');
                micBtn.innerHTML = '🎤';
            }
            return;
        }

        isListening = true;
        if (micBtn) {
            micBtn.classList.add('listening');
            micBtn.innerHTML = '🔴';
        }

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('chatbot-input-field');
            if (input) {
                input.value = transcript;
            }
            handleSend();
        };

        recognition.onerror = function(event) {
            console.log('Speech recognition error:', event.error);
            isListening = false;
            if (micBtn) {
                micBtn.classList.remove('listening');
                micBtn.innerHTML = '🎤';
            }
        };

        recognition.onend = function() {
            isListening = false;
            if (micBtn) {
                micBtn.classList.remove('listening');
                micBtn.innerHTML = '🎤';
            }
        };

        recognition.start();
    }

    function speakText(text) {
        if (!speechSynthesisSupported) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
        if (speechSynthesisSupported) {
            window.speechSynthesis.cancel();
        }
    }

    function toggleAutoSpeak() {
        autoSpeakEnabled = !autoSpeakEnabled;
        return autoSpeakEnabled;
    }

    return {
        init,
        toggleChat,
        handleSend,
        generateResponse,
        speakText,
        stopSpeaking,
        toggleAutoSpeak,
        getCurrentRole: getCurrentUserRole
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chatbot;
}
