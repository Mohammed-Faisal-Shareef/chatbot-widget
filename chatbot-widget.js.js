(function() {
  'use strict';
  
  if (window.ChatbotWidget) return;

  const requestCache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000;

  function generateMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    let responses = [];

    if (lowerMessage.includes("admission") || lowerMessage.includes("apply")) {
      responses.push("Our admissions are open year-round! You can apply online through our website. Would you like information about specific programs or requirements?");
    }

    if (lowerMessage.includes("fee") || lowerMessage.includes("cost") || lowerMessage.includes("price")) {
      responses.push("Our fee structure varies by program. Undergraduate courses start at $15,000/year, while graduate programs range from $20,000-$30,000. Financial aid is available for eligible students.");
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("email")) {
      responses.push("You can reach us at:\n📞 Phone:+966 11 215 7777:\n📧 Email: info@alfaisal.edu:\n📍 Address: 123 Education St, City, State");
    }

    if (lowerMessage.includes("program") || lowerMessage.includes("course") || lowerMessage.includes("major")) {
      responses.push("We offer programs in Engineering, Business, Arts, Sciences, and more. What field are you interested in?");
    }

    if (lowerMessage.includes("scholarship") || lowerMessage.includes("financial aid")) {
      responses.push("We offer merit-based and need-based scholarships. Merit scholarships range from 25-100% tuition coverage. Visit our Financial Aid office or apply online for consideration.");
    }

    if (lowerMessage.includes("campus") || lowerMessage.includes("visit") || lowerMessage.includes("tour")) {
      responses.push("We'd love to show you our campus! Tours are available Monday-Friday at 10 AM and 2 PM. You can schedule a tour on our website or call our admissions office.");
    }

    if (lowerMessage.includes("deadline") || lowerMessage.includes("when")) {
      responses.push("Application deadlines vary by program:\n• Fall semester: June 15\n• Spring semester: November 15\n• Summer semester: March 15\n\nEarly applications are encouraged!");
    }

    if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
      responses.push("Hello! How can I assist you today? I can help with admissions, fees, programs, and general inquiries.");
    }

    if (lowerMessage.includes("thank")) {
      responses.push("You're welcome! Is there anything else I can help you with?");
    }

    if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
      responses.push("Thank you for chatting with us! Feel free to reach out anytime. Have a great day!");
    }

    if (
      lowerMessage.includes("what can you do") ||
      lowerMessage.includes("purpose") ||
      lowerMessage.includes("what are you") ||
      lowerMessage.includes("help")
    ) {
      responses.push("I'm here to help you with questions about admissions, fees, programs, scholarships, campus tours, deadlines, and contact information. You can ask me anything about these topics!");
    }

    if (responses.length === 0) {
      responses.push(`Thank you for your message about "${message}". A support representative will assist you shortly. Meanwhile, you can ask about admissions, fees, programs, or contact details!`);
    }

    return responses.join("\n\n");
  }

  async function sendMessageToBot(message) {
    if (!message || typeof message !== "string") {
      throw new Error("Invalid message");
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new Error("Message cannot be empty");
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockResponse(trimmedMessage);
  }

  const styles = `
    .chatbot-widget * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    .chatbot-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }

    .chatbot-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;  
      height: 50px; 
      border-radius: 50%;
      background: rgb(0, 0, 0);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      z-index: 10000;
    }

    .chatbot-fab:hover {
      transform: scale(1.05);
    }

    .chatbot-fab-tooltip {
      position: absolute;
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 12px;
      padding: 8px 14px;
      background: rgb(0, 0, 0);
      color: white;
      font-size: 13px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }

    .chatbot-fab-tooltip::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -4px;
      transform: translateY(-50%) rotate(45deg);
      width: 8px;
      height: 8px;
      background: rgb(0, 0, 0);
    }

    .chatbot-fab:hover .chatbot-fab-tooltip {
      opacity: 1;
    }

    .chatbot-notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .chatbot-window {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 420px;
      height: 80%;
      max-width: 95vw;
      max-height: 85vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform-origin: bottom right;
      animation: slideUpFromButton 0.3s ease-out;
      z-index: 9999;
    }

    .chatbot-header {
      background: rgb(0, 0, 0);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }

    .chatbot-header-info {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .chatbot-header-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chatbot-header-title {
      font-size: 16px;
      font-weight: 600;
      display: block;
    }

    .chatbot-header-status {
      font-size: 13px;
      opacity: 0.8;
    }

    .chatbot-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chatbot-header-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      position: relative;
    }

    .chatbot-header-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .chatbot-dropdown {
      position: relative;
    }

    .chatbot-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      min-width: 180px;
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 10001;
    }

    .chatbot-dropdown-menu.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .chatbot-dropdown-item {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1f2937;
      cursor: pointer;
      transition: background 0.15s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 14px;
    }

    .chatbot-dropdown-item:hover {
      background: #f3f4f6;
    }

    .chatbot-dropdown-item svg {
      width: 16px;
      height: 16px;
      color: #6b7280;
    }

    .chatbot-dropdown-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 4px 0;
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
    }

    .chatbot-quick-replies {
      margin-bottom: 20px;
    }

    .chatbot-quick-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 10px;
      display: block;
    }

    .chatbot-quick-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .chatbot-quick-btn {
      font-size: 13px;
      padding: 10px 16px;
      border: 1px solid rgba(9, 47, 87, 0.2);
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chatbot-quick-btn:hover {
      background: rgb(0, 0, 0);
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chatbot-message {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-end;
      gap: 10px;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chatbot-message.user {
      justify-content: flex-end;
    }

    .chatbot-message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .chatbot-message.bot .chatbot-message-avatar {
      background: rgb(0, 0, 0);
      color: white;
    }

    .chatbot-message.user .chatbot-message-avatar {
      background: #d1d5db;
      color: #4b5563;
    }

    .chatbot-message-avatar.hidden {
      opacity: 0;
    }

    .chatbot-message-content {
      display: flex;
      flex-direction: column;
    }

    .chatbot-message.user .chatbot-message-content {
      align-items: flex-end;
    }

    .chatbot-message-bubble {
      padding: 12px 18px;
      border-radius: 18px;
      max-width: 340px;
      font-size: 15px;
      line-height: 1.5;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      white-space: pre-wrap;
    }

    .chatbot-message.bot .chatbot-message-bubble {
      background: rgb(241, 245, 249);
      color: #1f2937;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
    }

    .chatbot-message.user .chatbot-message-bubble {
      background: rgb(0, 0, 0);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .chatbot-message-time {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
      padding: 0 4px;
    }

    .chatbot-typing {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      margin-bottom: 16px;
      animation: fadeIn 0.3s;
    }

    .chatbot-typing-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgb(0, 0, 0);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .chatbot-typing-bubble {
      padding: 14px 18px;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      background: white;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .chatbot-typing-dots {
      display: flex;
      gap: 4px;
    }

    .chatbot-typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      animation: bounce 1.4s infinite;
    }

    .chatbot-typing-dot:nth-child(2) {
      animation-delay: 0.15s;
    }

    .chatbot-typing-dot:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes bounce {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-8px);
      }
    }

    .chatbot-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 10px;
    }

    .chatbot-input {
      flex: 1;
      padding: 12px 18px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 15px;
      outline: none;
      background: #f9fafb;
      transition: all 0.2s;
    }

    .chatbot-input:focus {
      border-color: rgb(0, 0, 0);
      background: white;
    }

    .chatbot-input::placeholder {
      color: #9ca3af;
    }

    .chatbot-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .chatbot-send-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgb(0, 0, 0);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chatbot-send-btn:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .chatbot-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .chatbot-icon {
      width: 20px;
      height: 20px;
    }

    .chatbot-icon-sm {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 768px) {
      .chatbot-fab {
        bottom: 12px;
        right: 12px;
      }

      .chatbot-window {
        bottom: 88px;
        right: 12px;
        width: 380px;
        height: 550px;
        max-height: 75vh;
      }
    }

    @media (max-width: 640px) {
      .chatbot-fab {
        width: 44px;
        height: 44px;
        bottom: 12px;
        right: 12px;
      }

      .chatbot-window {
        bottom: 80px;
        right: 12px;
        width: calc(100vw - 24px);
        max-width: 400px;
        height: 500px;
        max-height: 70vh;
      }

      .chatbot-header {
        padding: 16px;
      }

      .chatbot-messages {
        padding: 16px;
      }

      .chatbot-message-bubble {
        max-width: calc(100vw - 140px);
        font-size: 14px;
      }

      .chatbot-input-area {
        padding: 12px;
      }

      .chatbot-input {
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .chatbot-window {
        width: calc(100vw - 16px);
        right: 8px;
        bottom: 76px;
        height: 480px;
        max-height: 65vh;
      }

      .chatbot-fab {
        right: 8px;
        bottom: 8px;
      }

      .chatbot-message-bubble {
        max-width: calc(100vw - 120px);
      }

      .chatbot-quick-btn {
        font-size: 12px;
        padding: 8px 14px;
      }
    }

    @media (max-width: 360px) {
      .chatbot-message-bubble {
        max-width: calc(100vw - 100px);
        padding: 10px 14px;
      }

      .chatbot-header-title {
        font-size: 14px;
      }
    }

    @media (max-height: 500px) and (orientation: landscape) {
      .chatbot-window {
        height: 90vh;
        max-height: 90vh;
      }

      .chatbot-header {
        padding: 10px 16px;
      }

      .chatbot-header-title {
        font-size: 14px;
      }

      .chatbot-header-status {
        font-size: 11px;
      }

      .chatbot-messages {
        padding: 12px 16px;
      }

      .chatbot-header-avatar {
        width: 32px;
        height: 32px;
      }
    }
  `;

  const icons = {
    messageCircle: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
    send: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    x: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    user: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    messageSquare: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    ellipsis: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>',
    trash: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    download: '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
  };

  class Chatbot {
    constructor() {
      this.chatOpen = false;
      this.messages = [];
      this.isTyping = false;
      this.hasNewMessage = false;
      this.dropdownOpen = false;
      
      this.init();
    }

    init() {
      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);

      this.container = document.createElement('div');
      this.container.className = 'chatbot-widget';
      document.body.appendChild(this.container);

      this.loadFromStorage();
      this.render();

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (this.dropdownOpen && !e.target.closest('.chatbot-dropdown')) {
          this.dropdownOpen = false;
          this.updateDropdown();
        }
      });
    }

    loadFromStorage() {
      try {
        const savedMessages = sessionStorage.getItem('chatMessages');
        if (savedMessages) {
          this.messages = JSON.parse(savedMessages).map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } else {
          this.addBotMessage('Hi! How can I help you today?');
        }
      } catch (e) {
        console.error('Failed to load chatbot data:', e);
        this.addBotMessage('Hi! How can I help you today?');
      }
    }

    saveToStorage() {
      try {
        sessionStorage.setItem('chatMessages', JSON.stringify(this.messages));
      } catch (e) {
        console.error('Failed to save chatbot data:', e);
      }
    }

    addBotMessage(text) {
      const message = {
        id: `bot-${Date.now()}`,
        text,
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.push(message);
      if (!this.chatOpen) {
        this.hasNewMessage = true;
        this.render();
      } else {
        this.saveToStorage();
        this.updateMessages();
      }
    }

    async sendMessage(text) {
      const trimmedText = text.trim();
      if (!trimmedText || this.isTyping) return;

      const userMessage = {
        id: `user-${Date.now()}`,
        text: trimmedText,
        sender: 'user',
        timestamp: new Date()
      };

      this.messages.push(userMessage);
      this.isTyping = true;
      this.saveToStorage();
      this.updateMessages();

      try {
        const botReply = await sendMessageToBot(trimmedText);
        this.isTyping = false;
        this.addBotMessage(botReply);
      } catch (e) {
        this.isTyping = false;
        this.addBotMessage('Sorry, something went wrong. Please try again later.');
      }

      setTimeout(() => this.scrollToBottom(), 100);
    }

clearChat() {
  this.messages = [];
  sessionStorage.removeItem('chatMessages');
  this.addBotMessage('Hi! How can I help you today?');
  this.dropdownOpen = false;
  this.render();
}

    downloadChat() {
      const chatText = this.messages.map(msg => {
        const time = this.formatTime(msg.timestamp);
        const sender = msg.sender === 'user' ? 'You' : 'Assistant';
        return `[${time}] ${sender}: ${msg.text}`;
      }).join('\n\n');

      const blob = new Blob([chatText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.dropdownOpen = false;
      this.updateDropdown();
    }

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
      this.updateDropdown();
    }

    updateDropdown() {
      const menu = this.container.querySelector('.chatbot-dropdown-menu');
      if (menu) {
        if (this.dropdownOpen) {
          menu.classList.add('active');
        } else {
          menu.classList.remove('active');
        }
      }
    }

    toggleChat() {
      if (this.chatOpen) {
        const chatWindow = this.container.querySelector('.chatbot-window');
        if (chatWindow) {
          chatWindow.classList.add('closing');
          setTimeout(() => {
            this.chatOpen = false;
            this.dropdownOpen = false;
            this.render();
          }, 300);
        }
      } else {
        this.chatOpen = true;
        this.hasNewMessage = false;
        this.render();
        setTimeout(() => {
          const input = this.container.querySelector('.chatbot-input');
          if (input) input.focus();
          this.scrollToBottom();
        }, 100);
      }
    }

    formatTime(date) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    scrollToBottom() {
      const messagesContainer = this.container.querySelector('.chatbot-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    updateMessages() {
      if (!this.chatOpen) return;
      
      const messagesContainer = this.container.querySelector('.chatbot-messages');
      if (!messagesContainer) return;

      const quickReplies = ['Admissions Info', 'Fee Structure', 'Contact Us'];
      const showQuickReplies = this.messages.length <= 1 && !this.isTyping;

      messagesContainer.innerHTML = `
        ${showQuickReplies ? `
          <div class="chatbot-quick-replies">
            <span class="chatbot-quick-label">Quick options:</span>
            <div class="chatbot-quick-buttons">
              ${quickReplies.map(reply => 
                `<button class="chatbot-quick-btn" data-reply="${reply}">${reply}</button>`
              ).join('')}
            </div>
          </div>
        ` : ''}
        
        ${this.messages.map((msg, index) => {
          const showAvatar = index === 0 || this.messages[index - 1].sender !== msg.sender;
          const isUser = msg.sender === 'user';
          
          return `
            <div class="chatbot-message ${isUser ? 'user' : 'bot'}">
              ${!isUser ? `
                <div class="chatbot-message-avatar${showAvatar ? '' : ' hidden'}">
                  <span class="chatbot-icon-sm">${icons.messageSquare}</span>
                </div>
              ` : ''}
              
              <div class="chatbot-message-content">
                <div class="chatbot-message-bubble">${msg.text}</div>
                <span class="chatbot-message-time">${this.formatTime(msg.timestamp)}</span>
              </div>
              
              ${isUser ? `
                <div class="chatbot-message-avatar${showAvatar ? '' : ' hidden'}">
                  <span class="chatbot-icon-sm">${icons.user}</span>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
        
        ${this.isTyping ? `
          <div class="chatbot-typing">
            <div class="chatbot-typing-avatar">
              <span class="chatbot-icon-sm">${icons.messageSquare}</span>
            </div>
            <div class="chatbot-typing-bubble">
              <div class="chatbot-typing-dots">
                <span class="chatbot-typing-dot"></span>
                <span class="chatbot-typing-dot"></span>
                <span class="chatbot-typing-dot"></span>
              </div>
            </div>
          </div>
        ` : ''}
      `;

      const quickBtns = messagesContainer.querySelectorAll('.chatbot-quick-btn');
      if (quickBtns) {
        quickBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            this.sendMessage(btn.dataset.reply);
          });
        });
      }

      setTimeout(() => this.scrollToBottom(), 0);
    }

    renderChatWindow(darkClass) {
      const quickReplies = ['Admissions Info', 'Fee Structure', 'Contact Us'];
      const showQuickReplies = this.messages.length <= 1 && !this.isTyping;

      return `
        <div class="chatbot-window${darkClass}" id="chatbot-window">
          <div class="chatbot-header">
            <div class="chatbot-header-info">
              <div class="chatbot-header-avatar">
                <span class="chatbot-icon-sm">${icons.messageSquare}</span>
              </div>
              <div>
                <span class="chatbot-header-title">Alfaisal AI Assistant</span>
                <span class="chatbot-header-status">${this.isTyping ? 'Typing...' : 'Online'}</span>
              </div>
            </div>
            <div class="chatbot-header-actions">
              <div class="chatbot-dropdown">
                <button class="chatbot-header-btn" id="chatbot-menu">
                  <span class="chatbot-icon">${icons.ellipsis}</span>
                </button>
                <div class="chatbot-dropdown-menu" id="chatbot-dropdown-menu">
                  <button class="chatbot-dropdown-item" id="chatbot-clear">
                    ${icons.trash}
                    <span>Clear Chat</span>
                  </button>
                  <button class="chatbot-dropdown-item" id="chatbot-download">
                    ${icons.download}
                    <span>Download Chat</span>
                  </button>
                </div>
              </div>
              <button class="chatbot-header-btn" id="chatbot-close">
                <span class="chatbot-icon">${icons.x}</span>
              </button>
            </div>
          </div>
          
          <div class="chatbot-messages">
            ${showQuickReplies ? `
              <div class="chatbot-quick-replies">
                <span class="chatbot-quick-label">Quick options:</span>
                <div class="chatbot-quick-buttons">
                  ${quickReplies.map(reply => 
                    `<button class="chatbot-quick-btn" data-reply="${reply}">${reply}</button>`
                  ).join('')}
                </div>
              </div>
            ` : ''}
            
            ${this.messages.map((msg, index) => {
              const showAvatar = index === 0 || this.messages[index - 1].sender !== msg.sender;
              const isUser = msg.sender === 'user';
              
              return `
                <div class="chatbot-message ${isUser ? 'user' : 'bot'}">
                  ${!isUser ? `
                    <div class="chatbot-message-avatar${showAvatar ? '' : ' hidden'}">
                      <span class="chatbot-icon-sm">${icons.messageSquare}</span>
                    </div>
                  ` : ''}
                  
                  <div class="chatbot-message-content">
                    <div class="chatbot-message-bubble">${msg.text}</div>
                    <span class="chatbot-message-time">${this.formatTime(msg.timestamp)}</span>
                  </div>
                  
                  ${isUser ? `
                    <div class="chatbot-message-avatar${showAvatar ? '' : ' hidden'}">
                      <span class="chatbot-icon-sm">${icons.user}</span>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
            
            ${this.isTyping ? `
              <div class="chatbot-typing">
                <div class="chatbot-typing-avatar">
                  <span class="chatbot-icon-sm">${icons.messageSquare}</span>
                </div>
                <div class="chatbot-typing-bubble">
                  <div class="chatbot-typing-dots">
                    <span class="chatbot-typing-dot"></span>
                    <span class="chatbot-typing-dot"></span>
                    <span class="chatbot-typing-dot"></span>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="chatbot-input-area">
            <input 
              type="text" 
              class="chatbot-input" 
              placeholder="Type a message..." 
              maxlength="500"
              ${this.isTyping ? 'disabled' : ''}
              id="chatbot-input"
              autocomplete="off"
            />
            <button 
              class="chatbot-send-btn" 
              id="chatbot-send"
              type="button"
              ${this.isTyping ? 'disabled' : ''}
            >
              <span class="chatbot-icon-sm">${icons.send}</span>
            </button>
          </div>
        </div>
      `;
    }

    render() {
      const darkClass = '';
      
      const fabHTML = `
        <button class="chatbot-fab" id="chatbot-open">
          <span class="chatbot-fab-tooltip">${this.chatOpen ? 'Close Chat' : 'Alfaisal AI Assistant'}</span>
          <span class="chatbot-icon">${icons.messageCircle}</span>
          ${this.hasNewMessage && !this.chatOpen ? '<span class="chatbot-notification-badge"></span>' : ''}
        </button>
      `;
      
      const windowHTML = this.chatOpen ? this.renderChatWindow(darkClass) : '';
      
      this.container.innerHTML = fabHTML + windowHTML;
      
      this.attachEventListeners();
    }

    attachEventListeners() {
      const openBtn = this.container.querySelector('#chatbot-open');
      const chatWindow = this.container.querySelector('#chatbot-window');
      
      if (openBtn) {
        openBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleChat();
        });
      }

      if (chatWindow) {
        chatWindow.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }

      if (this.chatOpen) {
        const closeBtn = this.container.querySelector('#chatbot-close');
        const menuBtn = this.container.querySelector('#chatbot-menu');
        const clearBtn = this.container.querySelector('#chatbot-clear');
        const downloadBtn = this.container.querySelector('#chatbot-download');
        const input = this.container.querySelector('#chatbot-input');
        const sendBtn = this.container.querySelector('#chatbot-send');
        const quickBtns = this.container.querySelectorAll('.chatbot-quick-btn');

        if (closeBtn) {
          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChat();
          });
        }

        if (menuBtn) {
          menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
          });
        }

        if (clearBtn) {
          clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearChat();
          });
        }

        if (downloadBtn) {
          downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadChat();
          });
        }

        if (sendBtn && input) {
          const handleSend = () => {
            const message = input.value;
            if (message.trim()) {
              this.sendMessage(message);
              input.value = '';
              setTimeout(() => input.focus(), 50);
            }
          };

          sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleSend();
          });

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          });
        }

        if (quickBtns) {
          quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              this.sendMessage(btn.dataset.reply);
            });
          });
        }

        setTimeout(() => this.scrollToBottom(), 0);
      }
    }
  }

  function initChatbot() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.ChatbotWidget = new Chatbot();
      });
    } else {
      window.ChatbotWidget = new Chatbot();
    }
  }

  initChatbot();
})();