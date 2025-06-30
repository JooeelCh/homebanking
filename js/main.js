let user = loadUser() || {
  username: 'admin',
  balance: 0,
  debt: 0,
  movements: []
};

function loadUser() {
  return JSON.parse(localStorage.getItem('user'));
}

function saveUser() {
  localStorage.setItem('user', JSON.stringify(user));
}

function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === 'admin' && password === '1234') {
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'pages/user.html';
  } else {
    document.getElementById('error').textContent = 'Usuario o clave incorrectos.';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showSection('home');
  updateUI();
});


function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
  }

  if (sectionId === 'home') {
    updateUI();
  }

  if (sectionId === 'movements') {
    updateMovements();
  }

  if (sectionId === 'debts') {
    updateDebt();
  }
}

function showOption(subOption, option) {
  const elementos = document.querySelectorAll(`.${subOption}-option`);
  elementos.forEach(el => el.classList.add('hidden'));

  const activo = document.getElementById(`${subOption}-${option}`);
  if (activo) activo.classList.remove('hidden');
}

function balanceOptions(option) {
  showOption('balance', option);
}

function debtOptions(option) {
  showOption('debt', option);
}

function showTransferForm(option) {
  showOption('transfer-form', option);
}

function deposit(event) {
  event.preventDefault();
  const amount = Number(document.getElementById('deposit-amount').value);
  if (amount <= 0 || isNaN(amount)) return alert("Monto inválido.");

  user.balance += amount;
  addMovement(`Depósito de $${amount}`);
  saveUser();
  updateUI();
}

function withdraw(event) {
  event.preventDefault();
  const amount = Number(document.getElementById('withdraw-amount').value);
  if (amount > user.balance) return alert("Saldo insuficiente.");
  if (amount <= 0 || isNaN(amount)) return alert("Monto inválido.");

  user.balance -= amount;
  addMovement(`Retiro de $${amount}`);
  saveUser();
  updateUI();
}

function requestLoan(event) {
  event.preventDefault();
  const amount = Number(document.getElementById('debt-amount').value);
  if (amount <= 0 || isNaN(amount)) return alert("Monto inválido.");

  const interest = 0.10;
  const total = amount + amount * interest;

  user.debt += total;
  user.balance += amount;
  addMovement(`Préstamo de $${amount} (+10% interés = $${total.toFixed(2)})`);
  saveUser();
  updateUI();
}

function transfer(event, type) {
  event.preventDefault();

  const recipient = document.getElementById(type === 'alias' ? 'alias' : 'cbu').value.trim();
  const amount = Number(document.getElementById(`${type}-amount`).value);

  if (!recipient || amount <= 0 || isNaN(amount)) return alert("Datos inválidos.");
  if (amount > user.balance) return alert("Saldo insuficiente.");

  user.balance -= amount;
  addMovement(`Transferencia a ${type.toUpperCase()} ${recipient}: $${amount}`);
  saveUser();
  updateUI();
}

function addMovement(desc) {
  const entry = `${new Date().toLocaleString()} - ${desc}`;
  user.movements.unshift(entry);
  if (user.movements.length > 10) user.movements.pop();
}

function updateUI() {
  document.getElementById('actual-balance').textContent = user.balance;
  document.getElementById('actual-debt').textContent = user.debt;

  const ul = document.getElementById('last-movements');
  ul.innerHTML = '';
  user.movements.slice(0, 3).forEach(mov => {
    const li = document.createElement('li');
    li.textContent = mov;
    ul.appendChild(li);
  });
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  window.location.href = '../index.html';
}
