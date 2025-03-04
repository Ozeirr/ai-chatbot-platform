import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress
} from '@mui/material';
import { apiService } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [messageData, setMessageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics summary
        const summaryResponse = await apiService.getAnalyticsSummary();
        setAnalyticsData(summaryResponse.data);
        
        // Fetch daily sessions
        const sessionsResponse = await apiService.getDailySessions();
        setSessionData(sessionsResponse.data);
        
        // Fetch daily messages
        const messagesResponse = await apiService.getDailyMessages();
        setMessageData(messagesResponse.data);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const sessionChartData = {
    labels: sessionData?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Daily Sessions',
        data: sessionData?.map(item => item.count) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const messageChartData = {
    labels: messageData?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Daily Messages',
        data: messageData?.map(item => item.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Sessions
            </Typography>
            <Typography variant="h4">
              {analyticsData?.total_sessions || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Messages
            </Typography>
            <Typography variant="h4">
              {analyticsData?.total_messages || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Avg. Messages/Session
            </Typography>
            <Typography variant="h4">
              {analyticsData?.avg_messages_per_session || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Date Range
            </Typography>
            <Typography variant="body1">
              {analyticsData?.date_range || 'Last 30 days'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Daily Sessions" />
            <CardContent>
              <Line data={sessionChartData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Daily Messages" />
            <CardContent>
              <Line data={messageChartData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
