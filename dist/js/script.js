'use strict';

const account1 = {
  owner: 'Marie Smith',
  movements: [5500, 489.23, -536.5, 16000, 642.21, -1233.9, 99.97, -1250],
  interestRate: 1.2, // %
  pin: 1234,
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Mark Davis',
  movements: [10000, -390, 1150, -810, -2290, -1200, 7500, -50],
  interestRate: 1.5,
  pin: 6789,

  currency: 'USD',
  locale: 'en-US',
};

const labelWelcome = document.querySelector('.greet--username');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const btnLogin = document.querySelector('.login__btn');
const showTransfer = document.querySelector('.show--transfer');
const btnTransfer = document.querySelector('.btn--transfer');
const btnLoan = document.querySelector('.btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan--amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const loginBtn = document.querySelector('.login-btn');
const loginDisplay = document.querySelector('.main__container');
const operationTransfer = document.querySelector('.btn--transfer');
const transferModal = document.querySelector('.modal__transfer');
const closeModal = document.querySelectorAll('.close-modal');
const overlay = document.querySelector('.overlay');
const showLoanReq = document.querySelector('.show--loan');
const loanModal = document.querySelector('.modal__loan');
const btnLogout = document.querySelector('.logout--btn');
/////////////////////////////////////////////////

const accounts = [account1, account2];
let currentAccount, timer;
let sorted = false;
// Functions

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  console.log(acc);
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${type}</div>     
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  displayMovements(acc);

  calcDisplayBalance(acc);

  calcDisplaySummary(acc);
};

const starLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      currentAccount = [];
      loginDisplay.classList.remove('hidden');
    }
    time--;
  };

  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

loginBtn.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    loginDisplay.classList.toggle('hidden');
    labelWelcome.textContent = `${currentAccount.owner.split(' ')[0]}`;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat('en-US', options).format(
      now
    );

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = starLogOutTimer();

    updateUI(currentAccount);
  }
});

showTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  setTimeout(() => {
    transferModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }, 500);

  currentAccount.username === 'ms'
    ? (inputTransferTo.placeholder = '"md" account')
    : (inputTransferTo.placeholder = '"ms" account');
});

showLoanReq.addEventListener('click', function (e) {
  e.preventDefault();
  e.preventDefault();
  setTimeout(() => {
    loanModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }, 500);
});

closeModal.forEach(btn =>
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!transferModal.className.includes('hidden')) {
      transferModal.classList.add('hidden');
      overlay.classList.add('hidden');
    }
    if (!loanModal.className.includes('hidden')) {
      loanModal.classList.add('hidden');
      overlay.classList.add('hidden');
    }
  })
);

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);

  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    updateUI(currentAccount);

    setTimeout(() => {
      transferModal.classList.add('hidden');
      overlay.classList.add('hidden');
    }, 500);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  console.log(amount);

  console;
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);

      updateUI(currentAccount);
    }, 3000);

    setTimeout(() => {
      loanModal.classList.add('hidden');
      overlay.classList.add('hidden');
    }, 500);
  }
  inputLoanAmount.value = '';
});

btnSort.addEventListener('click', function (e) {
  console.log('click');
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

btnLogout.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = [];
  loginDisplay.classList.remove('hidden');
});
