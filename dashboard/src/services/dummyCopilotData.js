export const dummyQuestions = [
  "Usage Summary",
  "Explain Today's Water Usage",
  "Water Consumption Breakdown",
  "Activity Analysis",
  "Why did AI predict this activity?",
  "Explain the AI Confidence",
  "Compare with Yesterday",
  "Compare with Last Week",
  "Weekly Trend",
  "Monthly Trend",
  "Peak Usage Hours",
  "Water Saving Tips",
  "Personalized Recommendations",
  "Possible Water Leakage",
  "Generate Today's Report",
  "Generate Weekly Report",
  "Generate Monthly Report"
];

export const usageBreakdownData = [
  { name: 'Bathing', value: 45, color: '#06b6d4' },
  { name: 'Kitchen', value: 25, color: '#10b981' },
  { name: 'Gardening', value: 15, color: '#a855f7' },
  { name: 'Cleaning', value: 10, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#94a3b8' },
];

export const timelineData = [
  { id: 1, start: '07:30 AM', end: '07:45 AM', duration: '15m', litres: 42, activity: 'Bathing', color: '#06b6d4' },
  { id: 2, start: '08:15 AM', end: '08:20 AM', duration: '5m', litres: 12, activity: 'Kitchen', color: '#10b981' },
  { id: 3, start: '10:00 AM', end: '10:30 AM', duration: '30m', litres: 35, activity: 'Gardening', color: '#a855f7' },
  { id: 4, start: '01:45 PM', end: '01:50 PM', duration: '5m', litres: 15, activity: 'Cleaning', color: '#f59e0b' },
];

export const recentReports = [
  { id: 1, date: 'Aug 05, 2025', activity: 'High Usage', water: '210L', status: 'Review Needed', confidence: '89%' },
  { id: 2, date: 'Aug 04, 2025', activity: 'Normal', water: '145L', status: 'Optimal', confidence: '96%' },
];

export const generateAIResponse = (query) => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('summary')) {
    return "Here is your **Usage Summary** for today:\n\n- **Total Water Used**: 157 Litres\n- **Number of Sessions**: 4\n- **Average Flow Rate**: 12.5 L/min\n- **Status**: Normal\n\nYou are on track to stay below your daily limit!";
  }
  if (lowerQuery.includes('breakdown')) {
    return "Your water consumption is distributed as follows:\n\n- **Bathing**: 45%\n- **Kitchen**: 25%\n- **Gardening**: 15%\n- **Cleaning**: 10%\n- **Other**: 5%\n\nMost of your water usage is coming from bathing today. Consider taking shorter showers to improve efficiency!";
  }
  if (lowerQuery.includes('why did ai predict') || lowerQuery.includes('bathing')) {
    return "I predicted **Bathing** with a 94% confidence based on several factors:\n\n- **Duration**: 15 minutes\n- **Water Consumed**: 42 Litres\n- **Flow Rate**: Sustained at ~14 L/min\n- **Historical Pattern**: Matches your typical morning routine.\n\nThe steady, prolonged flow rate strongly correlates with a shower profile rather than intermittent kitchen use.";
  }
  if (lowerQuery.includes('reduce') || lowerQuery.includes('tips') || lowerQuery.includes('recommendation')) {
    return "Here are some **Personalized Recommendations** for you:\n\n1. **Shorter Showers**: Cutting your shower time by just 2 minutes can save up to 15 liters daily.\n2. **Water Plants at Night**: You currently water at 10 AM. Switching to evening reduces evaporation.\n3. **Check Kitchen Faucet**: The flow rate in the kitchen was slightly higher than average. You might benefit from a low-flow aerator.\n\n*Estimated Daily Savings: 20-30 Litres*";
  }
  if (lowerQuery.includes('report')) {
    return "### 📊 Today's Water Usage Report\n\n**Total Usage:** 157L / 200L Goal (Good) 🟢\n**Overall Health Score:** 85/100\n\n**Key Events:**\n- Morning Shower (42L)\n- Garden Watering (35L)\n\n**AI Assessment:**\nUsage patterns are normal. No leaks detected. Excellent efficiency in the kitchen today!";
  }
  if (lowerQuery.includes('leakage')) {
    return "I have analyzed your baseline flow data. **No continuous background flows** were detected during off-peak hours (1 AM - 5 AM). Your plumbing appears to be leak-free at the moment! 💧";
  }

  return "I'm analyzing your water usage data. Based on the patterns, everything looks stable today. Your current flow rate is 16.6 L/min, which is normal for your typical activities. Is there a specific aspect of your consumption you'd like me to break down further?";
};
