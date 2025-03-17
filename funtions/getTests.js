const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const database = client.db('upsc_test');
    const tests = await database.collection('tests').find().toArray();
    return {
      statusCode: 200,
      body: JSON.stringify(tests),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch tests' }),
    };
  } finally {
    await client.close();
  }
};