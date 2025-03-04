/*
 *   Copyright (c) 2025 
 *   All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { 
  Button, Box, Typography, TextField, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import crawlerService from '../../services/crawlerService';

// Status chip component to show crawler job status with appropriate color
const StatusChip = ({ status }) => {
  let color = 'default';
  
  switch(status) {
    case 'pending':
      color = 'warning';
      break;
    case 'running':
      color = 'primary';
      break;
    case 'completed':
      color = 'success';
      break;
    case 'failed':
      color = 'error';
      break;
    default:
      color = 'default';
  }
  
  return <Chip label={status} color={color} size="small" />;
};

// Result dialog to show crawler results
const CrawlerResultDialog = ({ open, handleClose, result }) => {
  if (!result) return null;
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Crawler Results</DialogTitle>
      <DialogContent>
        {result.error ? (
          <Typography color="error">{result.error}</Typography>
        ) : (
          <Box>
            {/* Display crawler results based on actual structure from api/core/crawler.py */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Results Summary:</Typography>
            
            {/* This display will need to be customized based on the actual structure */}
            {/* of data returned by your crawler implementation */}
            {Object.entries(result).map(([key, value]) => {
              // Skip complex nested objects for simple display
              if (typeof value !== 'object') {
                return (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{key}:</strong> {value}
                    </Typography>
                  </Box>
                );
              }
              return null;
            })}
            
            {/* If your crawler returns pages or links, display them */}
            {result.pages && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Pages Crawled: {result.pages.length}</Typography>
                <Box sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
                  {result.pages.slice(0, 50).map((page, index) => (
                    <Typography variant="body2" key={index}>
                      • {page.url || page.title || JSON.stringify(page)}
                    </Typography>
                  ))}
                  {result.pages.length > 50 && (
                    <Typography variant="body2" color="text.secondary">
                      ...and {result.pages.length - 50} more
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const ClientCrawler = ({ clientId, clientWebsite }) => {
  const [customUrl, setCustomUrl] = useState('');
  const [crawlerJobs, setCrawlerJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedJobResult, setSelectedJobResult] = useState(null);

  // Fetch crawler jobs when component mounts
  useEffect(() => {
    if (clientId) {
      loadCrawlerJobs();
    }
  }, [clientId]);

  // Periodically refresh pending/running jobs
  useEffect(() => {
    const hasActiveJobs = crawlerJobs.some(job => 
      job.status === 'pending' || job.status === 'running'
    );
    
    if (hasActiveJobs && clientId) {
      const interval = setInterval(() => {
        loadCrawlerJobs();
      }, 5000); // Refresh every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [crawlerJobs, clientId]);

  const loadCrawlerJobs = async () => {
    if (!clientId) return;
    
    setJobLoading(true);
    try {
      const response = await crawlerService.getClientCrawlJobs(clientId);
      setCrawlerJobs(response.data);
    } catch (error) {
      console.error("Failed to load crawler jobs:", error);
    } finally {
      setJobLoading(false);
    }
  };

  const handleStartCrawl = async (useCustomUrl = false) => {
    setLoading(true);
    try {
      const url = useCustomUrl ? customUrl : null;
      await crawlerService.startCrawl(clientId, url);
      setCustomUrl(''); // Reset the custom URL input
      loadCrawlerJobs(); // Reload the jobs list
    } catch (error) {
      console.error("Failed to start crawler:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (job) => {
    setSelectedJobResult(job.result_data);
    setResultDialogOpen(true);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Website Crawler</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => handleStartCrawl(false)}
            disabled={loading || !clientWebsite}
            sx={{ mr: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Crawl Website"}
          </Button>
          <Typography variant="body2">
            {clientWebsite ? `Will crawl: ${clientWebsite}` : "No website URL set for client"}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Or crawl a specific URL:</Typography>
          <Box sx={{ display: 'flex' }}>
            <TextField 
              fullWidth
              size="small"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/specific-page"
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              onClick={() => handleStartCrawl(true)}
              disabled={loading || !customUrl}
            >
              {loading ? <CircularProgress size={24} /> : "Crawl"}
            </Button>
          </Box>
        </Box>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Crawler History</Typography>
        {jobLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={30} />
          </Box>
        ) : crawlerJobs.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {crawlerJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.url}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={job.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(job.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {job.completed_at ? new Date(job.completed_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        disabled={job.status !== 'completed'}
                        onClick={() => handleViewResult(job)}
                      >
                        View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
            No crawler jobs found for this client
          </Typography>
        )}
        
        <CrawlerResultDialog
          open={resultDialogOpen}
          handleClose={() => setResultDialogOpen(false)}
          result={selectedJobResult}
        />
      </CardContent>
    </Card>
  );
};

export default ClientCrawler;
