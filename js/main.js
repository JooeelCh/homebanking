function loadUser() {
  return JSON.parse(localStorage.getItem('loggedInUser'));
}
let user = loadUser();

function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

if (!user || !localStorage.getItem('isLoggedIn')) {
  window.location.href = '../index.html';
}

function saveUser() {
  let users = getUsers();
  users = users.map(u => u.username === user.username ? user : u);
  saveUsers(users);
  localStorage.setItem('loggedInUser', JSON.stringify(user));
}

document.addEventListener("DOMContentLoaded", () => {
  showSection('home');
  updateUI();
})

document.getElementById('title').textContent = `Bienvenido ${user.name} ${user.lastName}`;

function toggleDarkMode() {
  const isDark = document.getElementById('darkModeSwitch').checked;
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('darkMode', isDark);
}

function getSwalTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  return {
    background: isDark ? '#1e1e1e' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    confirmButtonColor: isDark ? '#00bfa6' : '#3085d6',
    cancelButtonColor: isDark ? '#555' : '#aaa'
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.getElementById('darkModeSwitch').checked = isDark;
  document.body.classList.toggle('dark-mode', isDark);

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

  if (sectionId === 'profile') {
    showProfile();
  }

  if (sectionId === 'movements') {
    updateMovements();
  }

  if (sectionId === 'debts') {
    updateDebt();
  }
}

function showProfile() {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-lastname').textContent = user.lastName;
  document.getElementById('user-document').textContent = user.numberDni;
  document.getElementById('user-alias').textContent = user.alias;
  document.getElementById('user-cbu').textContent = user.cbu;
}

function enableEdit() {
  const swalTheme = getSwalTheme();

  Swal.fire({
    title: 'Actualizar alias',
    input: 'text',
    inputLabel: 'Nuevo alias',
    inputPlaceholder: 'Ingresá tu nuevo alias',
    inputValue: user.alias,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    ...swalTheme,
    preConfirm: (newAlias) => {
      newAlias = newAlias.trim();
      if (!newAlias) {
        Swal.showValidationMessage('El alias no puede estar vacío.');
        return false;
      }

      const users = getUsers();
      const exists = users.some(u => u.alias === newAlias && u.username !== user.username);
      if (exists) {
        Swal.showValidationMessage('El alias ya está en uso.');
        return false;
      }

      return newAlias;
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      user.alias = result.value;
      saveUser();
      document.getElementById('user-alias').textContent = user.alias;

      Swal.fire({
        icon: 'success',
        title: 'Alias actualizado',
        text: `Tu nuevo alias es: ${user.alias}`,
        ...swalTheme,
      });
    }
  });
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
  const swalTheme = getSwalTheme();
  const amount = Number(document.getElementById('deposit-amount').value);
  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({
      icon: 'error',
      title: 'Monto inválido',
      text: 'Ingresá un monto mayor a 0.',
      ...swalTheme,
    });
    return;
  }

  user.balance += amount;
  addMovement(`Depósito de $${amount}`);
  saveUser();
  updateUI();

  Swal.fire({
    icon: 'success',
    title: 'Depósito realizado',
    text: `Has depositado $${amount}. Tu saldo actual es $${user.balance}.`,
    ...swalTheme,
  });
}

function withdraw(event) {
  event.preventDefault();
  const swalTheme = getSwalTheme();
  const amount = Number(document.getElementById('withdraw-amount').value);
  if (amount > user.balance) {
    Swal.fire({
      icon: 'error',
      title: 'Saldo insuficiente',
      text: 'No tenés fondos suficientes para esta operación.',
      ...swalTheme,
    });
    return;
  }
  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({
      icon: 'error',
      title: 'Monto inválido',
      text: 'Ingresá un monto mayor a 0.',
      ...swalTheme,
    });
    return;
  }

  Swal.fire({
    icon: 'warning',
    title: '¿Confirmás el retiro?',
    text: `Vas a retirar $${amount}.`,
    showCancelButton: true,
    confirmButtonText: 'Sí, retirar',
    cancelButtonText: 'Cancelar',
    ...swalTheme,
  }).then((result) => {
    if (result.isConfirmed) {
      user.balance -= amount;
      addMovement(`Retiro de $${amount}`);
      saveUser();
      updateUI();

      Swal.fire({
        icon: 'success',
        title: 'Retiro realizado',
        text: `Has retirado $${amount}. Tu saldo actual es $${user.balance}.`,
        ...swalTheme,
      });
    }
  });
}

function requestLoan(event) {
  event.preventDefault();
  const swalTheme = getSwalTheme();
  const amount = Number(document.getElementById('debt-amount').value);
  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({
      icon: 'error',
      title: 'Monto inválido',
      text: 'Ingresá un monto mayor a 0.',
      ...swalTheme,
    });
    return;
  }

  const interest = 0.10;
  const total = amount + amount * interest;

  user.debt += total;
  user.balance += amount;
  addMovement(`Préstamo de $${amount} (+10% interés = $${total.toFixed(2)})`);
  saveUser();
  updateUI();

  Swal.fire({
  icon: 'warning',
  title: '¿Estas seguro de solicitar el prestamo?',
  html: `Vas a solicitar un préstamo de <strong>$${amount}</strong>.<br>Tendras que devolver: <strong>$${total.toFixed(2)}</strong>`,
  showCancelButton: true,
  confirmButtonText: 'Sí, solicitar',
  cancelButtonText: 'Cancelar',
  ...swalTheme,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Préstamo aprobado',
        html: `Monto solicitado: <strong>$${amount}</strong><br>Total a devolver: <strong>$${total.toFixed(2)}</strong>`,
        ...swalTheme,
      });
    }
  });
}

function updateDebt() {
  const debtSpan = document.getElementById('debt');
  const payDebtBtn = document.getElementById('pay-debt-btn');

  if (debtSpan) {
    debtSpan.textContent = user.debt;
  }

    if (payDebtBtn) {
    payDebtBtn.disabled = user.debt === 0;
    payDebtBtn.style.opacity = user.debt === 0 ? '0.5' : '1';
    payDebtBtn.style.cursor = user.debt === 0 ? 'not-allowed' : 'pointer';
    payDebtBtn.textContent = user.debt === 0 ? 'Sin deuda' : 'Pagar préstamo';
  }


  const debtMovements = document.getElementById('debt-movements');
  if (debtMovements) {
    debtMovements.innerHTML = '';
    const debtRelated = user.movements.filter(mov => mov.includes("Préstamo") || mov.includes("deuda"));
    debtRelated.forEach(mov => {
      const li = document.createElement('li');
      li.textContent = mov;
      debtMovements.appendChild(li);
    });
  }
}

function payDebt(event) {
  event.preventDefault();
  const amount = Number(document.getElementById('debt-pay-amount').value);

  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({
      ...getSwalTheme(),
      icon: 'error',
      title: 'Monto inválido',
      text: 'Ingresá un monto mayor a 0.'
    });
    return;
  }

  if (amount > user.balance) {
    Swal.fire({
      ...getSwalTheme(),
      icon: 'error',
      title: 'Saldo insuficiente',
      text: 'No tenés suficiente saldo para pagar esa deuda.'
    });
    return;
  }

  if (amount > user.debt) {
    Swal.fire({
      ...getSwalTheme(),
      icon: 'warning',
      title: 'Monto mayor a la deuda',
      text: `Tu deuda es de $${user.debt}. No podés pagar más de eso.`
    });
    return;
  }

  user.balance -= amount;
  user.debt -= amount;
  addMovement(`Pago de deuda por $${amount}`);
  saveUser();
  updateUI();
  updateDebt();

  Swal.fire({
    ...getSwalTheme(),
    icon: 'success',
    title: 'Deuda pagada',
    text: `Pagaste $${amount}. Deuda restante: $${user.debt.toFixed(2)}`
  });
}

function transfer(event, type) {
  event.preventDefault();
  const swalTheme = getSwalTheme();

  const recipient = document.getElementById(type === 'alias' ? 'alias' : 'cbu').value.trim();
  const amount = Number(document.getElementById(`${type}-amount`).value);

  if (!recipient || amount <= 0 || isNaN(amount)) {
    Swal.fire({
      icon: 'error',
      title: 'Datos inválidos',
      text: 'Completá todos los campos correctamente.',
      ...swalTheme,
    });
    return;
  }
  if (amount > user.balance) {
    Swal.fire({
      icon: 'error',
      title: 'Saldo insuficiente',
      text: 'No tenés saldo suficiente para realizar esta transferencia.',
      ...swalTheme,
    });
    return;
  }

  Swal.fire({
  icon: 'warning',
  title: '¿Confirmás la transferencia?',
  html: `Vas a transferir <strong>$${amount}</strong> al ${type.toUpperCase()}: <strong>${recipient}</strong>.`,
  showCancelButton: true,
  confirmButtonText: 'Sí, transferir',
  cancelButtonText: 'Cancelar',
  ...swalTheme,
  }).then((result) => {
    if (result.isConfirmed) {
      user.balance -= amount;
      addMovement(`Transferencia a ${type.toUpperCase()} ${recipient}: $${amount}`);
      saveUser();
      updateUI();

      Swal.fire({
        icon: 'success',
        title: 'Transferencia exitosa',
        text: `Transferiste $${amount} a ${type.toUpperCase()} ${recipient}.`,
        ...swalTheme,
      });
    }
  });
}

function updateMovements() {
  const ul = document.getElementById('movements-list');
  if (!ul) return;

  const filter = document.getElementById('filter-type')?.value || 'all';
  const order = document.getElementById('order')?.value || 'desc';

  let filtered = [...user.movements];

  filtered = filtered.filter(mov => {
    if (filter === 'deposit') return mov.includes('Depósito');
    if (filter === 'withdraw') return mov.includes('Retiro');
    if (filter === 'loan') return mov.includes('Préstamo') || mov.includes('deuda');
    if (filter === 'transfer') return mov.includes('Transferencia');
    return true;
  });

  if (order === 'asc') filtered = filtered.slice().reverse();

  ul.innerHTML = '';
  filtered.forEach(mov => {
    const li = document.createElement('li');
    li.textContent = mov;
    ul.appendChild(li);
  });
}

function addMovement(desc) {
  const entry = `${new Date().toLocaleString()} - ${desc}`;
  user.movements.unshift(entry);
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
  localStorage.removeItem('loggedInUser');
  window.location.href = '../index.html';
}
