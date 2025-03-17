const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const type = event.queryStringParameters.type || 'overall';
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('upsc_test');
    const marks = await db.collection('marks').find().toArray();
    const users = await db.collection('users').find().toArray();

    let filteredMarks = marks;
    if (type === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredMarks = marks.filter(m => new Date(m.submittedAt) >= oneWeekAgo);
    } else if (type === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filteredMarks = marks.filter(m => new Date(m.submittedAt) >= oneMonthAgo);
    }

    const leaderboard = filteredMarks.reduce((acc, mark) => {
      const user = users.find(u => u._id.toString() === mark.userId);
      if (!user) return acc;
      if (!acc[user._id]) acc[user._id] = { username: user.username || 'Anonymous', totalMarks: 0, userId: user._id.toString() };
      acc[user._id].totalMarks += mark.marks;
      return acc;
    }, {});

    const leaderboardList = Object.values(leaderboard).sort((a, b) => b.totalMarks - a.totalMarks);
    return {
      statusCode: 200,
      body: JSON.stringify(leaderboardList),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch leaderboard' }),
    };
  } finally {
    await client.close();
  }
};