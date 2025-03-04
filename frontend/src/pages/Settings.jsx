import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  FormGroup,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CachedIcon from '@mui/icons-material/Cached';
import { useAuth } from '../hooks/useAuth';

function Settings() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [settings, setSettings] = useState({
    enableLogging: true,
    maxMessagesPerSession: 50,
    defaultResponseTime: 5,
    autoEndSessions: true,
    sessionTimeout: 30,
  });

  useEffect(() => {
    if (user) {
      setApiKey(user.apiKey);
    }
  }, [user]);

  const handleSettingChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSettings = () => {
    // In a real app, you would save the settings to the backend
    setCopySuccess(true);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopySuccess(true);
  };

  const handleSnackbarClose = () => {
    setCopySuccess(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* API Key Card */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="API Key" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  value={apiKey}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  onClick={handleCopyApiKey}
                  startIcon={<ContentCopyIcon />}
                >
                  Copy
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Use this API key to authenticate your chat widget. Keep this key secure and don't share it publicly.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Widget Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Widget Configuration" />
            <CardContent>
              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Welcome Message"
                      name="welcomeMessage"
                      defaultValue="Hi there! How can I help you today?"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Primary Color"
                      name="primaryColor"
                      defaultValue="#4A90E2"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bot Name"
                      name="botName"
                      defaultValue="AI Assistant"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={true}
                            name="showAvatar"
                          />
                        }
                        label="Show Bot Avatar"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Chat Settings" />
            <CardContent>
              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Max Messages Per Session"
                      name="maxMessagesPerSession"
                      type="number"
                      value={settings.maxMessagesPerSession}
                      onChange={handleSettingChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Default Response Time (seconds)"
                      name="defaultResponseTime"
                      type="number"
                      value={settings.defaultResponseTime}
                      onChange={handleSettingChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      name="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={handleSettingChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.autoEndSessions}
                            onChange={handleSettingChange}
                            name="autoEndSessions"
                          />
                        }
                        label="Auto-end Inactive Sessions"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.enableLogging}
                            onChange={handleSettingChange}
                            name="enableLogging"
                          />
                        }
                        label="Enable Conversation Logging"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Integration Code */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Website Integration" />
            <CardContent>
              <Typography variant="body2" gutterBottom>
                Add this code to your website to embed the chat widget:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  my: 2
                }}
              >
                {`<script src="https://chatbot-platform.example.com/widget.js" 
   data-api-key="${apiKey}"
   data-primary-color="#4A90E2"
   data-bot-name="AI Assistant">
</script>`}
              </Paper>
              <Button
                variant="contained"
                onClick={handleCopyApiKey}
                startIcon={<ContentCopyIcon />}
              >
                Copy Integration Code
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Copied to clipboard!"
      />
    </Box>
  );
}

export default Settings;
