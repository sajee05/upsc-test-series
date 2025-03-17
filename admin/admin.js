document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-test-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('test-name').value;
    const subject = document.getElementById('test-subject').value;
    const date = document.getElementById('test-date').value;
    const deadline = document.getElementById('test-deadline').value || date;

    // For local testing, log to console. Replace with actual fetch when hosted.
    console.log({ name, subject, date, deadline });
    alert('Test logged to console. Deploy admin to Netlify for full functionality.');

    // Uncomment this when hosting admin panel on Netlify:
    /*
    fetch('/.netlify/functions/addTest', {
      method: 'POST',
      body: JSON.stringify({ name, subject, date, deadline }),
    })
      .then(response => response.json())
      .then(() => {
        alert('Test added successfully!');
        e.target.reset();
      })
      .catch(error => console.error('Error adding test:', error));
    */
  });
});