/*
 *   Copyright (c) 2025 
 *   All rights reserved.
 */
import './styles.css';
import { adjustColor } from './utils/color-utils';

/**
 * AI Chatbot Widget
 * Include this script in your website to add the chatbot widget
 */

(function() {
  // Configuration from script tag attributes
  const scriptTag = document.currentScript;
  
  const config = {
    apiUrl: scriptTag.getAttribute('data-api-url') || 'https://api.example.com',
    apiKey: scriptTag.getAttribute('data-api-key'),
    botName: scriptTag.getAttribute('data-bot-name') || 'AI Assistant',
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#4A90E2',
    welcomeMessage: scriptTag.getAttribute('data-welcome-message') || 
      'Hi there! How can I help you today?'
  };
  
  // Apply custom color
  const customColorStyle = document.createElement('style');
  customColorStyle.innerHTML = `
    .ai-chatbot-button, .ai-chatbot-header, .ai-chatbot-send {
      background-color: ${config.primaryColor};
    }
    .ai-chatbot-button:hover {
      background-color: ${adjustColor(config.primaryColor, -20)};
    }
  `;
  document.head.appendChild(customColorStyle);
  
  // Create widget HTML
  const widgetHTML = `
    <div class="ai-chatbot-widget">
      <div class="ai-chatbot-button">
        <svg class="ai-chatbot-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="ai-chatbot-window">
        <div class="ai-chatbot-header">
          <div>${config.botName}</div>
          <div class="ai-chatbot-close">×</div>
        </div>
        <div class="ai-chatbot-messages">
          <div class="ai-chatbot-typing">
            <div class="ai-chatbot-dot"></div>
            <div class="ai-chatbot-dot"></div>
            <div class="ai-chatbot-dot"></div>
          </div>
        </div>
        <div class="ai-chatbot-input-container">
          <input type="text" class="ai-chatbot-input" placeholder="Type your message...">
          <button class="ai-chatbot-send">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Append widget to body
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = widgetHTML;
  document.body.appendChild(widgetContainer);
  
  // DOM references
  const chatbotButton = document.querySelector('.ai-chatbot-button');
  const chatbotWindow = document.querySelector('.ai-chatbot-window');
  const chatbotClose = document.querySelector('.ai-chatbot-close');
  const messagesContainer = document.querySelector('.ai-chatbot-messages');
  const inputField = document.querySelector('.ai-chatbot-input');
  const sendButton = document.querySelector('.ai-chatbot-send');
  const typingIndicator = document.querySelector('.ai-chatbot-typing');
  
  // State
  let sessionId = localStorage.getItem('ai-chatbot-session-id') || null;
  let messageHistory = JSON.parse(localStorage.getItem('ai-chatbot-messages') || '[]');
  
  // Functions
  function toggleChatWindow() {
    chatbotWindow.classList.toggle('open');
    if (chatbotWindow.classList.contains('open') && messagesContainer.children.length <= 1) {
      // Only add welcome message if no previous messages
      init();
    }
    
    // Scroll to bottom when opening
    if (chatbotWindow.classList.contains('open')) {
      scrollToBottom();
    }
  }
  
  function closeChatWindow() {
    chatbotWindow.classList.remove('open');
  }
  
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('ai-chatbot-message', 'user');
    messageElement.textContent = text;
    
    // Insert before typing indicator
    messagesContainer.insertBefore(messageElement, typingIndicator);
    scrollToBottom();
    
    // Save to history
    messageHistory.push({ type: 'user', text: text });
    saveHistory();
  }
  
  function addBotMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('ai-chatbot-message', 'bot');
    messageElement.textContent = text;
    
    // Insert before typing indicator
    messagesContainer.insertBefore(messageElement, typingIndicator);
    scrollToBottom();
    
    // Save to history
    messageHistory.push({ type: 'bot', text: text });
    saveHistory();
  }
  
  function saveHistory() {
    // Keep only the last 50 messages
    if (messageHistory.length > 50) {
      messageHistory = messageHistory.slice(messageHistory.length - 50);
    }
    localStorage.setItem('ai-chatbot-messages', JSON.stringify(messageHistory));
  }
  
  function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    scrollToBottom();
  }
  
  function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
  }
  
  async function sendMessage() {
    const message = inputField.value.trim();
    if (!message) return;
    
    // Clear input
    inputField.value = '';
    
    // Add user message to chat
    addUserMessage(message);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      const response = await fetchBotResponse(message);
      console.log('Bot response:', response);
      hideTypingIndicator();
      addBotMessage(response.message);
      
      // Store session ID
      if (response.session_id) {
        sessionId = response.session_id;
        localStorage.setItem('ai-chatbot-session-id', sessionId);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      hideTypingIndicator();
      addBotMessage('Sorry, I encountered a problem. Please try again later.');
    }
  }
  
  async function fetchBotResponse(message) {
    const url = `${config.apiUrl}/api/chat/`;
    
    const requestBody = {
      message: message
    };
    
    // Add session ID if available
    if (sessionId) {
      requestBody.session_id = sessionId;
    }
    
    // Check if API key is provided
    if (!config.apiKey) {
      console.error('API key is missing. Please provide a valid API key.');
      return { message: 'Configuration error: API key missing', session_id: null };
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  }
  
  // Load chat history
  function loadChatHistory() {
    if (messageHistory.length > 0) {
      // Clear default messages
      while (messagesContainer.firstChild) {
        if (messagesContainer.firstChild === typingIndicator) break;
        messagesContainer.removeChild(messagesContainer.firstChild);
      }
      
      // Add saved messages
      messageHistory.forEach(message => {
        if (message.type === 'user') {
          const messageElement = document.createElement('div');
          messageElement.classList.add('ai-chatbot-message', 'user');
          messageElement.textContent = message.text;
          messagesContainer.insertBefore(messageElement, typingIndicator);
        } else {
          const messageElement = document.createElement('div');
          messageElement.classList.add('ai-chatbot-message', 'bot');
          messageElement.textContent = message.text;
          messagesContainer.insertBefore(messageElement, typingIndicator);
        }
      });
    }
  }
  
  // Initialize
  function init() {
    if (messageHistory.length > 0) {
      loadChatHistory();
    } else {
      addBotMessage(config.welcomeMessage);
    }
  }
  
  // Event listeners
  chatbotButton.addEventListener('click', toggleChatWindow);
  chatbotClose.addEventListener('click', closeChatWindow);
  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Add a global method to programmatically open the chat
  window.openAIChatbot = function() {
    if (!chatbotWindow.classList.contains('open')) {
      toggleChatWindow();
    }
  };
})();
