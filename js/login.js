function getUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

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
