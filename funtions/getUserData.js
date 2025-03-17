const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const { type, userId } = event.queryStringParameters;
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('upsc_test');
    const marks = await db.collection('marks').find({ userId }).toArray();
    const tests = await db.collection('tests').find().toArray();

    const testMap = tests.reduce((acc, test) => {
      acc[test._id.toString()] = test.name;
      return acc;
    }, {});

    let data = [];
    if (type === 'marks') {
      data = marks.map(mark => ({ testName: testMap[mark.testId], marks: mark.marks }));
    } else if (type === 'reflections') {
      data = marks.map(mark => ({ testName: testMap[mark.testId], reflections: mark.reflections }));
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch user data' }),
    };
  } finally {
    await client.close();
  }
};