const WaterReading = require('../models/WaterReading');

// POST /api/water
exports.addReading = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('[waterController] Bad Request: Missing request body');
            return res.status(400).json({ error: 'Bad Request: Missing data' });
        }

        const io = req.app.get('io');
        const newReading = new WaterReading(req.body);
        const savedReading = await newReading.save();
        
        console.log(`[waterController] Successfully inserted reading into MongoDB. ID: ${savedReading._id}`);

        if (io) {
            io.emit('newReading', savedReading);
        }
        
        console.log(`[waterController] Responding with 201 Created`);
        res.status(201).json(savedReading);
    } catch (error) {
        console.error('[waterController] Exception while adding reading:', error);
        res.status(500).json({ error: 'Failed to add reading', details: error.message });
    }
};

// GET /api/water/latest
exports.getLatestReading = async (req, res) => {
    try {
        const latest = await WaterReading.findOne().sort({ createdAt: -1 });
        res.status(200).json(latest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get latest reading' });
    }
};

// GET /api/water/history
exports.getHistory = async (req, res) => {
    try {
        // limit to 100 for performance unless pagination is provided
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const history = await WaterReading.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

// GET /api/water/today
exports.getToday = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayReadings = await WaterReading.find({
            createdAt: { $gte: startOfDay }
        }).sort({ createdAt: 1 });
        
        res.status(200).json(todayReadings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch today\'s readings' });
    }
};

// GET /api/water/stats
exports.getStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayStats, weeklyStats, monthlyStats, overallStats] = await Promise.all([
            WaterReading.aggregate([
                { $match: { createdAt: { $gte: startOfToday } } },
                { $group: { _id: null, totalWater: { $max: "$totalWater" }, sessionWater: { $sum: "$sessionWater" } } }
            ]),
            WaterReading.aggregate([
                { $match: { createdAt: { $gte: startOfWeek } } },
                { $group: { _id: null, totalWater: { $max: "$totalWater" } } }
            ]),
            WaterReading.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, totalWater: { $max: "$totalWater" } } }
            ]),
            WaterReading.aggregate([
                { $group: { _id: null, avgFlow: { $avg: "$flowRate" }, peakFlow: { $max: "$flowRate" }, minFlow: { $min: "$flowRate" } } }
            ])
        ]);

        res.status(200).json({
            todayWater: todayStats[0]?.totalWater || 0,
            weeklyWater: weeklyStats[0]?.totalWater || 0,
            monthlyWater: monthlyStats[0]?.totalWater || 0,
            avgFlow: overallStats[0]?.avgFlow || 0,
            peakFlow: overallStats[0]?.peakFlow || 0,
            minFlow: overallStats[0]?.minFlow || 0,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// DELETE /api/water/clear
exports.clearReadings = async (req, res) => {
    try {
        await WaterReading.deleteMany({});
        res.status(200).json({ message: 'All readings cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear readings' });
    }
};

// GET /api/water/charts/hourly
// Example simple aggregation for charts
exports.getHourlyUsage = async (req, res) => {
    try {
        const hourlyData = await WaterReading.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        hour: { $hour: "$createdAt" }
                    },
                    usage: { $sum: "$sessionWater" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
            { $limit: 24 }
        ]);
        res.status(200).json(hourlyData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hourly usage' });
    }
};
