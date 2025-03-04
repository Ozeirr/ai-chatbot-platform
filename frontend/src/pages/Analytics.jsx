import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { apiService } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics summary
      const summaryResponse = await apiService.getAnalyticsSummary(timeRange);
      setAnalyticsData(summaryResponse.data);
      
      // Fetch daily sessions
      const sessionsResponse = await apiService.getDailySessions(timeRange);
      setSessionData(sessionsResponse.data);
      
      // Fetch daily messages
      const messagesResponse = await apiService.getDailyMessages(timeRange);
      setMessageData(messagesResponse.data);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate some derived metrics
  const calculateAverageSessionsPerDay = () => {
    if (!sessionData.length) return 0;
    const totalSessions = sessionData.reduce((sum, day) => sum + day.count, 0);
    return (totalSessions / sessionData.length).toFixed(1);
  };

  const calculateAverageMessagesPerDay = () => {
    if (!messageData.length) return 0;
    const totalMessages = messageData.reduce((sum, day) => sum + day.count, 0);
    return (totalMessages / messageData.length).toFixed(1);
  };

  const calculateEngagementRate = () => {
    if (!analyticsData || analyticsData.total_sessions === 0) return 0;
    return ((analyticsData.total_messages / analyticsData.total_sessions) * 100).toFixed(1);
  };

  // Prepare chart data
  const sessionChartData = {
    labels: sessionData.map(item => item.date),
    datasets: [
      {
        label: 'Daily Sessions',
        data: sessionData.map(item => item.count),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const messageChartData = {
    labels: messageData.map(item => item.date),
    datasets: [
      {
        label: 'Daily Messages',
        data: messageData.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // Create combined chart for comparison
  const combinedChartData = {
    labels: sessionData.map(item => item.date),
    datasets: [
      {
        type: 'line',
        label: 'Sessions',
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        data: sessionData.map(item => item.count),
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Messages',
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        data: messageData.map(item => item.count),
        yAxisID: 'y1',
      },
    ],
  };

  const combinedChartOptions = {
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sessions'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Messages'
        }
      },
    },
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
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Analytics</Typography>
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Sessions
            </Typography>
            <Typography variant="h4">
              {analyticsData?.total_sessions || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. {calculateAverageSessionsPerDay()} per day
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
            <Typography variant="body2" color="text.secondary">
              Avg. {calculateAverageMessagesPerDay()} per day
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Engagement Rate
            </Typography>
            <Typography variant="h4">
              {calculateEngagementRate()}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Messages per session
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
            <Typography variant="body2" color="text.secondary">
              Overall average
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart - Combined View */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Sessions & Messages Trends" />
        <CardContent>
          <Box sx={{ height: '400px' }}>
            <Line 
              options={combinedChartOptions} 
              data={combinedChartData}
              height="400px"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Charts - Individual */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Daily Sessions" />
            <CardContent>
              <Box sx={{ height: '300px' }}>
                <Bar 
                  data={{
                    labels: sessionData.map(item => item.date),
                    datasets: [{
                      label: 'Sessions',
                      data: sessionData.map(item => item.count),
                      backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    }]
                  }}
                  height="300px"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Daily Messages" />
            <CardContent>
              <Box sx={{ height: '300px' }}>
                <Bar 
                  data={{
                    labels: messageData.map(item => item.date),
                    datasets: [{
                      label: 'Messages',
                      data: messageData.map(item => item.count),
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    }]
                  }}
                  height="300px"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;
