document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-test-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('test-name').value;
    const subject = document.getElementById('test-subject').value;
    const date = document.getElementById('test-date').value;
    const deadline = document.getElementById('test-deadline').value || date;

    const testData = { name, subject, date, deadline };

    try {
      // Send data to local Flask server
      const response = await fetch('http://127.0.0.1:5050/addTest', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      if (!response.ok) throw new Error('Failed to save test locally');

      alert('Test added successfully!');
      e.target.reset();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update test locally.');
    }
  });
});
