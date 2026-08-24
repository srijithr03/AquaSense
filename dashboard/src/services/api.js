import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchUsageData = async (timeframe) => {
  try {
    // We will use the hourly charts API for now
    const response = await axios.get(`${API_URL}/api/water/charts/hourly`);
    const data = response.data;
    
    // Transform data to match frontend expectations
    return data.map(item => ({
      label: `${item._id.hour.toString().padStart(2, '0')}:00`,
      usage: item.usage
    }));
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return [];
  }
};

export const fetchHistoricalStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/water/stats`);
    const data = response.data;
    return {
      averageDaily: data.avgFlow,
      highestUsageDay: 'Today', // Simplifying for now
      totalMonthly: data.monthlyWater,
      leakageEvents: 0 // Mock for now unless implemented on backend
    };
  } catch (error) {
    console.error("Error fetching historical stats:", error);
    return {
      averageDaily: 0,
      highestUsageDay: '-',
      totalMonthly: 0,
      leakageEvents: 0
    };
  }
};

export const fetchDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/water/stats`);
    const latestResponse = await axios.get(`${API_URL}/api/water/latest`);
    
    return {
      stats: response.data,
      latest: latestResponse.data
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

let mockAlerts = [
  {
    id: 1,
    type: 'leak',
    title: 'Possible Leak Detected',
    description: 'Continuous ultra-low flow (1.2 L/min) detected for over 30 minutes. Please check your bathroom taps and toilet flappers.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    severity: 'high',
    isRead: false
  }
];

export const fetchAlerts = async () => {
  return [...mockAlerts];
};

export const markAlertRead = async (id) => {
  mockAlerts = mockAlerts.map(a => 
    a.id === id ? { ...a, isRead: true, readAt: new Date().toISOString() } : a
  );
  return [...mockAlerts];
};

export const markAlertUnread = async (id) => {
  mockAlerts = mockAlerts.map(a => 
    a.id === id ? { ...a, isRead: false, readAt: null } : a
  );
  return [...mockAlerts];
};

export const askCopilot = async (prompt, historyData) => {
  try {
    const response = await axios.post(`${API_URL}/api/ai/chat`, { prompt, historyData });
    return response.data.reply;
  } catch (error) {
    console.error("Error calling Copilot API:", error);
    return "Sorry, I am unable to connect to the AI service right now.";
  }
};
