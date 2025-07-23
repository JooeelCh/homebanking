const API_URL = "https://687e8fd2efe65e5200870664.mockapi.io/users";

let user = null;

function loadUser() {
  const userId = localStorage.getItem('loggedUserId');
  if (!userId) {
    window.location.href = '../index.html';
    return Promise.reject('No user logged');
  }

  return fetch(`${API_URL}/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar el usuario');
      return res.json();
    })
    .then(data => {
      user = data;
      document.getElementById('title').textContent = `Bienvenido ${user.name} ${user.lastName}`;
      return user;
    })
    .catch(err => {
      console.error(err);
      window.location.href = '../index.html';
    });
}

function saveUser() {
  if (!user) return Promise.reject('No user loaded');

  return fetch(`${API_URL}/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  }).then(res => {
    if (!res.ok) throw new Error('No se pudo guardar el usuario');
    return res.json();
  }).catch(err => {
    console.error(err);
    throw err;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.getElementById('darkModeSwitch').checked = isDark;
  document.body.classList.toggle('dark-mode', isDark);

  loadUser().then(() => {
    showSection('home');
    updateUI();
  });
});

function toggleDarkMode() {
  const isDark = document.getElementById('darkModeSwitch').checked;
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('darkMode', isDark);
}

function getSwalTheme() {
  const isDark = document.body.classList.contains('dark-mode');

  return {
    background: isDark ? '#0d1117' : '#ffffff',
    color: isDark ? '#f1f1f1' : '#212529',
    confirmButtonColor: isDark ? '#00bfa6' : '#007bff',
    cancelButtonColor: isDark ? '#888888' : '#6c757d'
  };
}

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
  if (!user) return;
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-lastname').textContent = user.lastName;
  document.getElementById('user-document').textContent = user.numberDni;
  document.getElementById('user-alias').textContent = user.alias;
  document.getElementById('user-cbu').textContent = user.cbu;
}

function enableEdit() {
  if (!user) return;
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
      return fetch(API_URL)
        .then(res => res.json())
        .then(users => {
          const exists = users.some(u => u.alias === newAlias && u.id !== user.id);
          if (exists) {
            Swal.showValidationMessage('El alias ya está en uso.');
            return false;
          }
          return newAlias;
        });
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      user.alias = result.value;
      saveUser().then(() => {
        document.getElementById('user-alias').textContent = user.alias;
        Swal.fire({
          icon: 'success',
          title: 'Alias actualizado',
          text: `Tu nuevo alias es: ${user.alias}`,
          ...swalTheme,
        });
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el alias',
          ...swalTheme,
        });
      });
    }
  });
}

function addMovement(desc) {
  const entry = `${new Date().toLocaleString()} - ${desc}`;
  user.movements.unshift(entry);
}

function updateUI() {
  if (!user) return;
  document.getElementById('actual-balance').textContent = user.balance;
  document.getElementById('actual-debt').textContent = user.debt;

  const ul = document.getElementById('last-movements');
  if (ul) {
    ul.innerHTML = '';
    user.movements.slice(0, 3).forEach(mov => {
      const li = document.createElement('li');
      li.textContent = mov;
      ul.appendChild(li);
    });
  }
}

function balanceOptions(option) {
  document.querySelectorAll('.balance-option').forEach(div => {
    div.classList.add('hidden');
  });

  const target = document.getElementById(`balance-${option}`);
  if (target) {
    target.classList.remove('hidden');
  }
}

function deposit(event) {
  event.preventDefault();
  const swalTheme = getSwalTheme();
  const amount = Number(document.getElementById('deposit-amount').value);
  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({ icon: 'error', title: 'Monto inválido', text: 'Ingresá un monto mayor a 0.', ...swalTheme });
    return;
  }

  user.balance += amount;
  addMovement(`Depósito de $${amount}`);

  saveUser().then(() => {
    updateUI();
    Swal.fire({ icon: 'success', title: 'Depósito realizado', text: `Has depositado $${amount}. Tu saldo actual es $${user.balance}.`, ...swalTheme });
  }).catch(() => {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el depósito.', ...swalTheme });
  });
}

function withdraw(event) {
  event.preventDefault();
  const swalTheme = getSwalTheme();
  const amount = Number(document.getElementById('withdraw-amount').value);
  if (amount > user.balance) {
    Swal.fire({ icon: 'error', title: 'Saldo insuficiente', text: 'No tenés fondos suficientes para esta operación.', ...swalTheme });
    return;
  }
  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({ icon: 'error', title: 'Monto inválido', text: 'Ingresá un monto mayor a 0.', ...swalTheme });
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

      saveUser().then(() => {
        updateUI();
        Swal.fire({ icon: 'success', title: 'Retiro realizado', text: `Has retirado $${amount}. Tu saldo actual es $${user.balance}.`, ...swalTheme });
      }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el retiro.', ...swalTheme });
      });
    }
  });
}

function debtOptions(option) {
  document.querySelectorAll('.debt-option').forEach(div => {
    div.classList.add('hidden');
  });

  const target = document.getElementById(`debt-${option}`);
  if (target) {
    target.classList.remove('hidden');
  }
}

function requestLoan(event) {
  event.preventDefault();
  const swalTheme = getSwalTheme();
  const amount = Number(document.getElementById('debt-amount').value);
  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({ icon: 'error', title: 'Monto inválido', text: 'Ingresá un monto mayor a 0.', ...swalTheme });
    return;
  }

  const interest = 0.10;
  const total = amount + amount * interest;

  Swal.fire({
    icon: 'warning',
    title: '¿Estas seguro de solicitar el préstamo?',
    html: `Vas a solicitar un préstamo de <strong>$${amount}</strong>.<br>Tendrás que devolver: <strong>$${total.toFixed(2)}</strong>`,
    showCancelButton: true,
    confirmButtonText: 'Sí, solicitar',
    cancelButtonText: 'Cancelar',
    ...swalTheme,
  }).then((result) => {
    if (result.isConfirmed) {
      user.debt += total;
      user.balance += amount;
      addMovement(`Préstamo de $${amount} (+10% interés = $${total.toFixed(2)})`);

      saveUser().then(() => {
        updateUI();
        Swal.fire({
          icon: "success",
          title: "Préstamo aprobado",
          html: `Monto solicitado: <strong>$${amount}</strong>.<br>Total a devolver: <strong>$${total.toFixed(2)}</strong>`,
          ...swalTheme,
        }).then(() => {
          showSection('home');
        });
      }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el préstamo.', ...swalTheme });
      });
    }
  });
}

function updateDebt() {
  if (!user) return;

  const debtSpan = document.getElementById('debt');
  const payDebtBtn = document.getElementById('pay-debt-btn');

  if (debtSpan) {
    debtSpan.textContent = user.debt.toFixed(2);
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
    const debtRelated = user.movements.filter(mov => mov.toLowerCase().includes("préstamo") || mov.toLowerCase().includes("deuda"))
      .slice(-5)
      .reverse();

    debtRelated.forEach(mov => {
      const li = document.createElement('li');
      li.textContent = mov;
      debtMovements.appendChild(li);
    });
  }
}

function payDebt(event) {
  event.preventDefault();
  const swalTheme = getSwalTheme();
  const amount = Number(document.getElementById('debt-pay-amount').value);

  if (amount <= 0 || isNaN(amount)) {
    Swal.fire({ ...swalTheme, icon: 'error', title: 'Monto inválido', text: 'Ingresá un monto mayor a 0.' });
    return;
  }

  if (amount > user.balance) {
    Swal.fire({ ...swalTheme, icon: 'error', title: 'Saldo insuficiente', text: 'No tenés suficiente saldo para pagar esa deuda.' });
    return;
  }

  if (amount > user.debt) {
    Swal.fire({ ...swalTheme, icon: 'warning', title: 'Monto mayor a la deuda', text: `Tu deuda es de $${user.debt.toFixed(2)}. No podés pagar más de eso.` });
    return;
  }

  user.balance -= amount;
  user.debt -= amount;
  addMovement(`Pago de deuda por $${amount}`);

  saveUser().then(() => {
    updateUI();
    updateDebt();

    Swal.fire({
      ...swalTheme,
      icon: 'success',
      title: 'Deuda pagada',
      text: `Pagaste $${amount}. Deuda restante: $${user.debt.toFixed(2)}`
    }).then(() => {
      showSection('home');
    });
  }).catch(() => {
    Swal.fire({ ...swalTheme, icon: 'error', title: 'Error', text: 'No se pudo guardar el pago de deuda.' });
  });
}

function showTransferForm(option) {
  document.querySelectorAll('.transfer-form-option').forEach(div => {
    div.classList.add('hidden');
  });

  const target = document.getElementById(`transfer-form-${option}`);
  if (target) {
    target.classList.remove('hidden');
  }
}

function transfer(event, type) {
  event.preventDefault();
  const swalTheme = getSwalTheme();

  const recipient = document.getElementById(type === 'alias' ? 'alias' : 'cbu').value.trim();
  const amount = Number(document.getElementById(`${type}-amount`).value);

  if (!recipient || amount <= 0 || isNaN(amount)) {
    Swal.fire({ icon: 'error', title: 'Datos inválidos', text: 'Completá todos los campos correctamente.', ...swalTheme });
    return;
  }
  if (amount > user.balance) {
    Swal.fire({ icon: 'error', title: 'Saldo insuficiente', text: 'No tenés saldo suficiente para realizar esta transferencia.', ...swalTheme });
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

      saveUser().then(() => {
        updateUI();
        Swal.fire({ icon: 'success', title: 'Transferencia exitosa', text: `Transferiste $${amount} a ${type.toUpperCase()} ${recipient}.`, ...swalTheme })
          .then(() => {
            showSection('home');
          });
      }).catch(() => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la transferencia.', ...swalTheme });
      });
    }
  });
}

function updateMovements(page = 1) {
  if (!user) return;
  const ul = document.getElementById('movements-list');
  if (!ul) return;

  const filter = document.getElementById('filter-type')?.value || 'all';
  const order = document.getElementById('order')?.value || 'desc';

  let filtered = [...user.movements];

  filtered = filtered.filter(mov => {
    if (filter === 'deposit') return mov.toLowerCase().includes('depósito');
    if (filter === 'withdraw') return mov.toLowerCase().includes('retiro');
    if (filter === 'loan') return mov.toLowerCase().includes('préstamo') || mov.toLowerCase().includes('deuda');
    if (filter === 'transfer') return mov.toLowerCase().includes('transferencia');
    return true;
  });

  if (order === 'asc') filtered = filtered.slice().reverse();

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  page = Math.min(Math.max(1, page), totalPages);

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = filtered.slice(start, end);

  ul.innerHTML = '';
  paginated.forEach(mov => {
    const li = document.createElement('li');
    li.textContent = mov;
    ul.appendChild(li);
  });

  renderPagination(page, totalPages);
}

function renderPagination(current, total) {
  const container = document.getElementById('pagination');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === current ? 'active-page' : '';
    btn.onclick = () => updateMovements(i);
    container.appendChild(btn);
  }
}

function logout() {
  localStorage.removeItem('loggedUserId');
  window.location.href = '../index.html';
}
