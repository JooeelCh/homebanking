function login(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const error = document.getElementById('error');

  const userValid = 'admin';
  const passValid = '1234';

  if (username === userValid && password === passValid) {
    window.location.href = 'pages/user.html';
  } else {
    error.textContent = 'Usuario o clave incorrectos.';
  }
}

let balance = 0
let debt = 0;
let debtMovements = [];
let lastMovements = []
let allMovements = []

function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden')
  })

  document.getElementById(id).classList.remove('hidden')

  if (id === 'movements') {
    updateMovements();
  }
}

function balanceOptions(id) {
  document.getElementById('deposit').classList.add('hidden');
  document.getElementById('withdraw').classList.add('hidden');

  if (id === 'deposit') {
    document.getElementById('deposit').classList.remove('hidden');
  } else if (id === 'withdraw') {
    document.getElementById('withdraw').classList.remove('hidden');
  }
}

function deposit(event) {
  if (event) event.preventDefault();

  const amount = Number(document.getElementById('deposit-amount').value);
  if (amount <= 0 || isNaN(amount)) return alert("Monto inválido.");

  const movement = `${new Date().toLocaleString()} - Depósito: $${amount}`;

  balance += amount;
  lastMovements.unshift(movement);
  allMovements.unshift(movement);

  if (lastMovements.length > 3) lastMovements = lastMovements.slice(0, 3);

  alert(`Depósitaste $${amount}. Tu saldo actual es: $${balance}`);

  updateBalance();
  showSection('home');
}

function withdraw(event) {
  if (event) event.preventDefault();

  const amount = Number(document.getElementById('withdraw-amount').value);
  if (amount <= 0 || isNaN(amount)) return alert("Monto inválido.");
  if (amount > balance) return alert("Saldo insuficiente.");

  const movement = `${new Date().toLocaleString()} - Retiro: $${amount}`;

  balance -= amount;
  lastMovements.unshift(movement);
  allMovements.unshift(movement);


  if (lastMovements.length > 3) lastMovements = lastMovements.slice(0, 3);

  alert(`Retiraste $${amount}. Tu saldo actual es: $${balance}`);

  updateBalance();
  showSection('home');
}

function debtOptions(option) {
  document.getElementById('debt-request').classList.add('hidden');
  document.getElementById('debt-pay').classList.add('hidden');

  if (option === 'request') {
    document.getElementById('debt-request').classList.remove('hidden');
  } else if (option === 'pay') {
    document.getElementById('debt-pay').classList.remove('hidden');
  }
}

function requestDebt(event) {
  event.preventDefault();

  const amount = Number(document.getElementById('debt-amount').value);
  if (amount <= 0 || isNaN(amount)) return alert("Monto inválido.");

  const interest = 0.10;
  const totalDebt = amount + (amount * interest);

  debt += totalDebt;
  balance += amount;

  const movement = `${new Date().toLocaleString()} - Préstamo: $${amount} (+10% = $${totalDebt.toFixed(2)})`;

  lastMovements.unshift(movement);
  allMovements.unshift(movement);
  debtMovements.unshift(movement);

  if (lastMovements.length > 3) lastMovements = lastMovements.slice(0, 3);
  if (debtMovements.length > 3) debtMovements = debtMovements.slice(0, 3);

  alert(`Préstamo de $${amount} aprobado. Deuda actual: $${totalDebt.toFixed(2)}.`);

  document.getElementById('debt-amount').value = "";
  updateBalance();
  updateDebt();
  showSection('home');
}

function payDebt(event) {
  event.preventDefault();

  const amount = Number(document.getElementById('debt-pay-amount').value);
  if (amount <= 0 || isNaN(amount)) return alert("Monto inválido.");
  if (amount > balance) return alert("Saldo insuficiente.");
  if (debt <= 0) return alert("No tenés deuda.");

  const payment = Math.min(amount, debt);

  debt -= payment;
  balance -= payment;

  const movement = `${new Date().toLocaleString()} - Pago de deuda: $${payment}`;

  lastMovements.unshift(movement);
  allMovements.unshift(movement);
  debtMovements.unshift(movement);

  if (lastMovements.length > 3) lastMovements = lastMovements.slice(0, 3);
  if (debtMovements.length > 3) debtMovements = debtMovements.slice(0, 3);

  alert(`Pagaste $${payment} de tu deuda. Deuda actual: $${debt.toFixed(2)}.`);

  document.getElementById('debt-pay-amount').value = "";
  updateBalance();
  updateDebt();
  showSection('home');
}

function showTransferForm(type) {
  document.getElementById('transfer-form-alias').classList.add('hidden');
  document.getElementById('transfer-form-cbu').classList.add('hidden');

  if (type === 'alias') {
    document.getElementById('transfer-form-alias').classList.remove('hidden');
  } else if (type === 'cbu') {
    document.getElementById('transfer-form-cbu').classList.remove('hidden');
  }
}

function submitTransfer(event, type) {
  event.preventDefault();

  let aux, amount;

  if (type === 'alias') {
    aux = document.getElementById('alias').value.trim();
    amount = Number(document.getElementById('alias-amount').value);
  } else {
    aux = document.getElementById('cbu').value.trim();
    amount = Number(document.getElementById('cbu-amount').value);
  }

  if (!aux || amount <= 0 || isNaN(amount)) {
    alert("Datos inválidos.");
    return;
  }

  if (amount > balance) {
    alert("Saldo insuficiente.");
    return;
  }

  balance -= amount;

  const movement = `${new Date().toLocaleString()} - Transferencia a ${aux}: $${amount}`;

  lastMovements.unshift(movement);
  allMovements.unshift(movement);
  if (lastMovements.length > 3) lastMovements = lastMovements.slice(0, 3);

  alert(`Transferiste $${amount} con exito a ${aux}.`);

  updateBalance();
  showSection('home');
}

function updateBalance() {
  document.getElementById('actual-balance').textContent = balance;

  const list = document.getElementById('last-movements');
  list.innerHTML = "";
  lastMovements.forEach(mov => {
    const li = document.createElement('li');
    li.textContent = mov;
    list.appendChild(li);
  });
}

function updateDebt() {
  document.getElementById('actual-debt').textContent = debt;
  document.getElementById('debt').textContent = debt;

  const list = document.getElementById('debt-movements');
  list.innerHTML = "";

  debtMovements.forEach(mov => {
    const li = document.createElement('li');
    li.textContent = mov;
    list.appendChild(li);
  });
}

function updateMovements() {
  const list = document.getElementById('movements-list');
  list.innerHTML = "";

  allMovements.forEach(mov => {
    const li = document.createElement('li');
    li.textContent = mov;
    list.appendChild(li);
  });
}

function logout() {
  window.location.href = '../index.html';
}
