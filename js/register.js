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

function generateAlias(username) {
  const random = Math.floor(Math.random() * 1000);
  return `${username.toLowerCase()}${random}`;
}

function generateCBU() {
  let cbu = '';
  for (let i = 0; i < 22; i++) {
    cbu += Math.floor(Math.random() * 10);
  }
  return cbu;
}

function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById('new-name').value.trim();
  const lastName = document.getElementById('new-lastname').value.trim();
  const numberDni = document.getElementById("new-document").value.trim();
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;

  if (!username || !password || !name || !lastName || !numberDni) {
    showRegisterError("Todos los campos son obligatorios.");
    return;
  }

  fetch(API_URL)
    .then(res => res.json())
    .then(users => {
      const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        showRegisterError("El usuario ya existe.");
        return;
      }

      let alias;
      do {
        alias = generateAlias(username);
      } while (users.some(u => u.alias === alias));

      let cbu;
      do {
        cbu = generateCBU();
      } while (users.some(u => u.cbu === cbu));

      const newUser = {
        name,
        lastName,
        numberDni,
        username,
        password,
        balance: 0,
        debt: 0,
        movements: [],
        alias,
        cbu
      };

      return fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
    })
    .then(res => {
      if (!res) return;
      return res.json();
    })
    .then(createdUser => {
      if (!createdUser) return;

      showRegisterSuccess("Usuario creado correctamente.");
      document.getElementById('register-form').reset();
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    })
    .catch(err => {
      console.error("Error al registrar:", err);
      showRegisterError("Ocurrió un error al registrar el usuario.");
    });
}

function showRegisterError(msg) {
  const el = document.getElementById('register-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

function showRegisterSuccess(msg) {
  const el = document.getElementById('register-success');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}
