document.addEventListener('DOMContentLoaded', () => {
  let user = null;

  // Dark mode toggle with system preference detection
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
    darkModeToggle.textContent = '☀️';
  }
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    darkModeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  });

  // Section switching logic
  function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Update active button styling
    document.querySelectorAll('.island-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
  }
  window.showSection = showSection; // Ensure function is accessible globally

  // Fetch Tests
  fetchTests();
  function fetchTests() {
    fetch('http://127.0.0.1:5050/getTests')
      .then(response => response.json())
      .then(data => {
        const testList = document.getElementById('test-list');
        testList.innerHTML = '';
        data.forEach(test => {
          const li = document.createElement('li');
          const status = getTestStatus(test);

          li.innerHTML = `<span class="status ${status.toLowerCase()}">${status}</span> ${test.name} - ${test.subject}`;
          li.classList.add('test-entry');

          if (status === 'Available') {
            li.style.cursor = 'pointer';
            li.onclick = () => openMarksModal(test);
          }

          testList.appendChild(li);
        });
      })
      .catch(error => console.error('Error fetching tests:', error));
  }

  function getTestStatus(test) {
    const today = new Date();
    const testDate = new Date(test.date);
    const deadline = new Date(test.deadline || test.date);
    if (today < testDate) return 'Upcoming';
    if (test.marksSubmitted) return 'Done';
    if (today > deadline) return 'Missed';
    return 'Available';
  }

  // Marks Modal
  let currentTest = null;
  window.openMarksModal = function (test) {
    if (!user) {
      document.getElementById('signin-modal').style.display = 'flex';
      return;
    }
    currentTest = test;
    document.getElementById('marks-modal').style.display = 'flex';
  };

  window.closeModal = function () {
    document.getElementById('marks-modal').style.display = 'none';
  };

  document.getElementById('marks-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const marks = document.getElementById('marks-input').value;
    const reflections = document.getElementById('reflections-input').value;
    fetch('http://127.0.0.1:5050/submitMarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId: currentTest._id, userId: user.id, marks, reflections }),
    })
      .then(response => response.json())
      .then(() => {
        closeModal();
        fetchTests();
        updateLeaderboard();
      })
      .catch(error => console.error('Error submitting marks:', error));
  });

  // Leaderboard
  const leaderboardType = document.getElementById('leaderboard-type');
  leaderboardType.addEventListener('change', updateLeaderboard);
  updateLeaderboard();
  setInterval(updateLeaderboard, 30000);

  function updateLeaderboard() {
    const type = leaderboardType.value;
    fetch(`http://127.0.0.1:5050/getLeaderboard?type=${type}`)
      .then(response => response.json())
      .then(data => {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        data.forEach(entry => {
          const li = document.createElement('li');
          li.textContent = `${entry.username}: ${entry.totalMarks}`;
          if (user && entry.userId === user.id) li.style.fontWeight = 'bold';
          leaderboardList.appendChild(li);
        });
      })
      .catch(error => console.error('Error fetching leaderboard:', error));
  }

  // Fetch User Data
  window.showUserData = function (type) {
    if (!user) return;
    fetch(`http://127.0.0.1:5050/getUserData?type=${type}&userId=${user.id}`)
      .then(response => response.json())
      .then(data => {
        const userDataDiv = document.getElementById('user-data');
        userDataDiv.innerHTML = '';
        if (type === 'marks') {
          data.forEach(mark => {
            userDataDiv.innerHTML += `<p>${mark.testName}: ${mark.marks}</p>`;
          });
        } else if (type === 'reflections') {
          data.forEach(reflection => {
            userDataDiv.innerHTML += `<p>${reflection.testName}: ${reflection.text}</p>`;
          });
        }
      })
      .catch(error => console.error('Error fetching user data:', error));
  };

  // Mobile UI Fixes
  function fixMobileUI() {
    document.querySelectorAll('.button').forEach(btn => {
      btn.style.display = 'block';
      btn.style.margin = '5px auto';
      btn.style.width = '80%';
    });
  }
  fixMobileUI();
});
