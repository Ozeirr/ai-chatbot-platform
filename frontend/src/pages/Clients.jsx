import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { apiService } from '../services/api';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    website_url: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClients();
      setClients(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.website_url.trim()) {
      errors.website_url = 'Website URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.website_url)) {
      errors.website_url = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClient = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await apiService.createClient(formData);
      setClients([...clients, response.data]);
      setOpenAddDialog(false);
      setFormData({ name: '', website_url: '' });
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to create client');
    }
  };

  const handleEditClient = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await apiService.updateClient(selectedClient.id, formData);
      setClients(clients.map(client => 
        client.id === selectedClient.id ? response.data : client
      ));
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Failed to update client');
    }
  };

  const handleDeleteClient = async () => {
    try {
      await apiService.deleteClient(selectedClient.id);
      setClients(clients.filter(client => client.id !== selectedClient.id));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client');
    }
  };

  const openEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      website_url: client.website_url
    });
    setOpenEditDialog(true);
  };

  const openDelete = (client) => {
    setSelectedClient(client);
    setOpenDeleteDialog(true);
  };

  const copyApiKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey);
    setCopySuccess('API key copied to clipboard!');
    setTimeout(() => setCopySuccess(''), 3000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormData({ name: '', website_url: '' });
            setFormErrors({});
            setOpenAddDialog(true);
          }}
        >
          Add Client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {copySuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {copySuccess}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Website URL</TableCell>
              <TableCell>API Key</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>
                    <a href={client.website_url} target="_blank" rel="noopener noreferrer">
                      {client.website_url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {client.api_key.substring(0, 8)}...
                      <IconButton size="small" onClick={() => copyApiKey(client.api_key)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => openEdit(client)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => openDelete(client)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Client Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="website_url"
            label="Website URL"
            fullWidth
            variant="outlined"
            value={formData.website_url}
            onChange={handleInputChange}
            error={!!formErrors.website_url}
            helperText={formErrors.website_url}
            placeholder="https://example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Client Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="website_url"
            label="Website URL"
            fullWidth
            variant="outlined"
            value={formData.website_url}
            onChange={handleInputChange}
            error={!!formErrors.website_url}
            helperText={formErrors.website_url}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditClient} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete client "{selectedClient?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteClient} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Clients;
