const API_URL = "https://687e8fd2efe65e5200870664.mockapi.io/users";

function toggleDarkMode() {
  const isDark = document.getElementById('darkModeSwitch').checked;
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('darkMode', isDark);
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.getElementById('darkModeSwitch').checked = isDark;
  document.body.classList.toggle('dark-mode', isDark);
});

function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  fetch(API_URL)
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.username.toLowerCase() === username && u.password === password);

      if (!user) {
        document.getElementById('error').textContent = 'Usuario o clave incorrectos.';
        return;
      }

      localStorage.setItem('loggedUserId', user.id);
      window.location.href = 'pages/user.html';
    })
    .catch(err => {
      console.error("Error al conectar con la API:", err);
      document.getElementById('error').textContent = 'Error de conexión. Intentá más tarde.';
    });
}
