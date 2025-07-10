function getUsers() {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function generateAlias(username) {
  const random = Math.floor(Math.random() * 1000);
  return `${username.toLowerCase()}${random}`;
}

function generateUniqueAlias(username, users) {
  let alias;
  let exists = true;
  while (exists) {
    alias = generateAlias(username);
    exists = users.some(u => u.alias === alias);
  }
  return alias;
}

function generateCBU() {
  let cbu = '';
  for (let i = 0; i < 22; i++) {
    cbu += Math.floor(Math.random() * 10);
  }
  return cbu;
}

function generateUniqueCBU(users) {
  let cbu;
  let exists = true;
  while (exists) {
    cbu = generateCBU();
    exists = users.some(u => u.cbu === cbu);
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
    name,
    lastName,
    numberDni,
    username,
    password,
    balance: 0,
    debt: 0,
    movements: [],
    alias: generateUniqueAlias(username, users),
    cbu: generateUniqueCBU(users)
  };

  users.push(newUser);
  saveUsers(users);

  showRegisterSuccess("Usuario creado correctamente.");
  document.getElementById('register-form').reset();
  window.location.href = 'index.html';
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
