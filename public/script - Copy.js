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

  // Navigation
  window.showSection = function(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.toggle('active', section.id === sectionId);
    });
    document.querySelectorAll('.island-btn').forEach(btn => {
      btn.classList.toggle('active', btn.onclick.toString().includes(sectionId));
    });
  };

  // Fetch tests
  fetchTests();
  function fetchTests() {
    fetch('/.netlify/functions/getTests')
      .then(response => response.json())
      .then(data => {
        const testList = document.getElementById('test-list');
        testList.innerHTML = '';
        data.forEach(test => {
          const li = document.createElement('li');
          const status = getTestStatus(test);
          li.innerHTML = `${test.name} - ${test.subject} (${test.date}) <span>${status}</span>`;
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

  // Marks modal
  let currentTest = null;
  window.openMarksModal = function(test) {
    if (!user) {
      document.getElementById('signin-modal').style.display = 'flex';
      return;
    }
    currentTest = test;
    document.getElementById('marks-modal').style.display = 'flex';
  };

  window.closeModal = function() {
    document.getElementById('marks-modal').style.display = 'none';
  };

  document.getElementById('marks-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const marks = document.getElementById('marks-input').value;
    const reflections = document.getElementById('reflections-input').value;
    fetch('/.netlify/functions/submitMarks', {
      method: 'POST',
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
  setInterval(updateLeaderboard, 30000); // Auto-update every 30 seconds

  function updateLeaderboard() {
    const type = leaderboardType.value;
    fetch(`/.netlify/functions/getLeaderboard?type=${type}`)
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

  // User data
  window.showUserData = function(type) {
    if (!user) return;
    fetch(`/.netlify/functions/getUserData?type=${type}&userId=${user.id}`)
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
            userDataDiv.innerHTML += `<p>${reflection.testName}: ${reflection.reflections}</p>`;
          });
        }
      })
      .catch(error => console.error('Error fetching user data:', error));
  };

  // Netlify Identity Authentication
  netlifyIdentity.on('init', (u) => {
    user = u;
    if (user && !user.user_metadata?.username) {
      document.getElementById('username-modal').style.display = 'flex';
    }
  });

  netlifyIdentity.on('login', (u) => {
    user = u;
    localStorage.setItem('user', JSON.stringify(user));
    if (!user.user_metadata?.username) {
      document.getElementById('username-modal').style.display = 'flex';
    }
  });

  netlifyIdentity.on('logout', () => {
    user = null;
    localStorage.removeItem('user');
  });

  window.signInWithNetlify = function() {
    netlifyIdentity.open('login');
    document.getElementById('signin-modal').style.display = 'none';
  };

  window.closeSignInModal = function() {
    document.getElementById('signin-modal').style.display = 'none';
  };

  window.saveUsername = function() {
    const username = document.getElementById('username-input').value;
    fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token.access_token}` },
      body: JSON.stringify({ username }),
    })
      .then(() => {
        user.user_metadata = { username };
        localStorage.setItem('user', JSON.stringify(user));
        document.getElementById('username-modal').style.display = 'none';
      })
      .catch(error => console.error('Error saving username:', error));
  };

  // Check saved user
  const savedUser = localStorage.getItem('user');
  if (savedUser) user = JSON.parse(savedUser);
});