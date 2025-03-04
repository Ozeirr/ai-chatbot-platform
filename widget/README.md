# AI Chatbot Widget

A customizable, embeddable chat widget that connects to the AI Chatbot Platform.

## Usage

Include the following script tag in your website:

```html
<script 
  src="https://chatbot-platform.example.com/widget.js" 
  data-api-key="YOUR_API_KEY"
  data-primary-color="#4A90E2"
  data-bot-name="AI Assistant">
</script>
```

## Customization Options

The widget can be customized with the following data attributes:

- `data-api-key`: Your client API key (required)
- `data-primary-color`: Primary color for the widget (default: #4A90E2)
- `data-bot-name`: Name of the chatbot (default: AI Assistant)
- `data-welcome-message`: Custom welcome message to display when chat is opened

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```
