/*
 *   Copyright (c) 2025 
 *   All rights reserved.
 */
import api from './api';

const crawlerService = {
  // Start a new crawl for a client
  startCrawl: async (clientId, url = null) => {
    const endpoint = `/clients/${clientId}/crawl`;
    const params = url ? { url } : {};
    return api.post(endpoint, null, { params });
  },
  
  // Get all crawler jobs for a client
  getClientCrawlJobs: async (clientId) => {
    return api.get(`/clients/${clientId}/jobs`);
  },
};

export default crawlerService;
