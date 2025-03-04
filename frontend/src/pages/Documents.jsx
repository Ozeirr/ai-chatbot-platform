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
  TextareaAutosize,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Visibility';
import { apiService } from '../services/api';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocuments();
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents data');
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
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (formData.url && !/^https?:\/\/.+/.test(formData.url)) {
      errors.url = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDocument = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await apiService.createDocument(formData);
      setDocuments([...documents, response.data]);
      setOpenAddDialog(false);
      setFormData({ title: '', content: '', url: '' });
    } catch (err) {
      console.error('Error adding document:', err);
      setError('Failed to create document');
    }
  };

  const handleEditDocument = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await apiService.updateDocument(selectedDocument.id, formData);
      setDocuments(documents.map(document => 
        document.id === selectedDocument.id ? response.data : document
      ));
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document');
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await apiService.deleteDocument(selectedDocument.id);
      setDocuments(documents.filter(document => document.id !== selectedDocument.id));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  const openEdit = (document) => {
    setSelectedDocument(document);
    setFormData({
      title: document.title,
      content: document.content,
      url: document.url || ''
    });
    setOpenEditDialog(true);
  };

  const openDelete = (document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };

  const openPreview = (document) => {
    setSelectedDocument(document);
    setOpenPreviewDialog(true);
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
        <Typography variant="h4">Documents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormData({ title: '', content: '', url: '' });
            setFormErrors({});
            setOpenAddDialog(true);
          }}
        >
          Add Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.title}</TableCell>
                  <TableCell>
                    {document.url ? (
                      <a href={document.url} target="_blank" rel="noopener noreferrer">
                        {document.url}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(document.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton color="info" onClick={() => openPreview(document)}>
                      <PreviewIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => openEdit(document)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => openDelete(document)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Document Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Document</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Document Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleInputChange}
            error={!!formErrors.title}
            helperText={formErrors.title}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="url"
            label="URL (Optional)"
            fullWidth
            variant="outlined"
            value={formData.url}
            onChange={handleInputChange}
            error={!!formErrors.url}
            helperText={formErrors.url}
            placeholder="https://example.com/page"
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" gutterBottom>
            Content
          </Typography>
          <TextareaAutosize
            name="content"
            minRows={10}
            placeholder="Enter document content here..."
            style={{ 
              width: '100%', 
              padding: '10px',
              borderColor: formErrors.content ? 'red' : '#ddd',
              borderRadius: '4px'
            }}
            value={formData.content}
            onChange={handleInputChange}
          />
          {formErrors.content && (
            <Typography variant="caption" color="error">
              {formErrors.content}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddDocument} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Document Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleInputChange}
            error={!!formErrors.title}
            helperText={formErrors.title}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="url"
            label="URL (Optional)"
            fullWidth
            variant="outlined"
            value={formData.url}
            onChange={handleInputChange}
            error={!!formErrors.url}
            helperText={formErrors.url}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" gutterBottom>
            Content
          </Typography>
          <TextareaAutosize
            name="content"
            minRows={10}
            style={{ 
              width: '100%', 
              padding: '10px',
              borderColor: formErrors.content ? 'red' : '#ddd',
              borderRadius: '4px'
            }}
            value={formData.content}
            onChange={handleInputChange}
          />
          {formErrors.content && (
            <Typography variant="caption" color="error">
              {formErrors.content}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditDocument} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Document Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete document "{selectedDocument?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteDocument} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Document Dialog */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedDocument?.title}</DialogTitle>
        <DialogContent>
          {selectedDocument?.url && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                URL:
              </Typography>
              <Typography variant="body2">
                <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer">
                  {selectedDocument.url}
                </a>
              </Typography>
            </Box>
          )}
          <Typography variant="subtitle2" gutterBottom>
            Content:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedDocument?.content}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Documents;
