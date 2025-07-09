function getUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;

  if (!username || !password) {
    showRegisterError("Todos los campos son obligatorios.");
    return;
  }

  let users = getUsers();

  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    showRegisterError("El usuario ya existe.");
    return;
  }

  const newUser = {
    username,
    password,
    balance: 0,
    debt: 0,
    movements: []
  };

  users.push(newUser);
  saveUsers(users);

  showRegisterSuccess("Usuario creado correctamente. Podés iniciar sesión.");
  document.getElementById('register-form').reset();
}

function showRegisterError(msg) {
  const el = document.getElementById('register-error');
  el.textContent = msg;
  el.style.display = 'block';

  setTimeout(() => {
    el.style.display = 'none';
  }, 4000);
}

function showRegisterSuccess(msg) {
  const el = document.getElementById('register-success');
  el.textContent = msg;
  el.style.display = 'block';

  setTimeout(() => {
    el.style.display = 'none';
  }, 4000);
}
