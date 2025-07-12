function toggleDarkMode() {
  const isDark = document.getElementById('darkModeSwitch').checked;
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('darkMode', isDark);
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.getElementById('darkModeSwitch').checked = isDark;
  document.body.classList.toggle('dark-mode', isDark);

  showSection('home');
  updateUI();
});

function getUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function ensureAdminUser() {
  const users = getUsers();

  const exists = users.some(u => u.username.toLowerCase() === 'admin');
  if (!exists) {
    users.push({
      username: 'admin',
      password: '1234',
      balance: 0,
      debt: 0,
      movements: ["Usuario admin creado automáticamente."],
      alias: 'admin',
      cbu: '0000000000000000000000'
    });
    saveUsers(users);
  }
}

ensureAdminUser();

function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user || user.password !== password) {
    document.getElementById('error').textContent = 'Usuario o clave incorrectos.';
    return;
  }

  localStorage.setItem('loggedInUser', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
  window.location.href = 'pages/user.html';
}
