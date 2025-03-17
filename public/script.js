document.addEventListener('DOMContentLoaded', () => {
  fetch('/.netlify/functions/getTests')
    .then(response => response.json())
    .then(data => {
      const testList = document.getElementById('test-list');
      data.forEach(test => {
        const li = document.createElement('li');
        li.textContent = `${test.name} - ${test.subject} (${test.date})`;
        testList.appendChild(li);
      });
    })
    .catch(error => console.error('Error fetching tests:', error));
});