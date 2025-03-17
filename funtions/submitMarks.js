const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const { testId, userId, marks, reflections } = JSON.parse(event.body);
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('upsc_test');
    await db.collection('marks').insertOne({ 
      testId, 
      userId, 
      marks: parseInt(marks), 
      reflections, 
      submittedAt: new Date() 
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Marks submitted' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit marks' }),
    };
  } finally {
    await client.close();
  }
};