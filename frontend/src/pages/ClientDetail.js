/*
 *   Copyright (c) 2025 
 *   All rights reserved.
 */
import React from 'react';
import { Box } from '@mui/material';
import ClientCrawler from '../components/clients/ClientCrawler';

const ClientDetail = ({ client }) => {
  return (
    <div>
      <h1>{client?.name}</h1>
      <p>{client?.description}</p>
      
      <Box sx={{ mt: 4 }}>
        <ClientCrawler 
          clientId={client?.id} 
          clientWebsite={client?.website_url} 
        />
      </Box>
    </div>
  );
};

export default ClientDetail;