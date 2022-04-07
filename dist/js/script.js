'use strict';

const account1 = {
  owner: 'Marie Smith',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1234,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Mark Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 6789,

  movementsDates: [
    '2022-01-01T13:15:33.035Z',
    '2022-01-30T09:48:16.867Z',
    '2022-01-05T18:49:59.371Z',
    '2022-01-31T14:18:46.235Z',
    '2022-02-01T14:43:26.374Z',
    '2022-02-02T06:04:23.907Z',
    '2022-02-03T16:33:06.386Z',
    '2022-02-04T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Nicolas Peña',
  movements: [
    {
      date: '2022-01-01T13:15:33.035Z',
      value: 500,
    },
    {
      date: "2022-02-01T13:15:33.035Z'",
      value: 300,
    },
  ],
  interestRate: 1.5,
  pin: 2222,
  currency: 'USD',
  locale: 'en-US',
};

const body = document.querySelector('body');
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
const reqTransfer = document.querySelector('.transfer__modal--btn');

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

const accounts = [account1, account2, account3];
let currentAccount, timer;
let sorted = false;
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 3) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

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
    .filter((int, i, arr) => {
      // console.log(arr);
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
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const starLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    // In  each cal, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 second, stop timer and log out
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrease counter
    time--;
  };
  // Set timer 5 minutes
  let time = 1000;
  // Call timer every sec
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers

/// LOGIN BUTTON-START
loginBtn.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    loginDisplay.classList.toggle('hidden');
    labelWelcome.textContent = `${currentAccount.owner.split(' ')[0]}`;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric', // 2-digit
      weekday: 'long', // short - narrow
    };

    labelDate.textContent = new Intl.DateTimeFormat('en-US', options).format(
      now
    );

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = starLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});
/// LOGIN BUTTON-ENDS

/// TRANSFER BUTTON-START
showTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  setTimeout(() => {
    transferModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }, 500);

  currentAccount.username === 'ms'
    ? (inputTransferTo.placeholder = 'send to md account')
    : (inputTransferTo.placeholder = 'send to ms account');
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
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);

    setTimeout(() => {
      transferModal.classList.add('hidden');
      overlay.classList.add('hidden');
    }, 500);
  }
});
/// TRANSFER BUTTON-ENDS

/// LOAN BUTTON-START
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  console.log(amount);

  console;
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 3000);

    setTimeout(() => {
      loanModal.classList.add('hidden');
      overlay.classList.add('hidden');
    }, 500);
  }
  inputLoanAmount.value = '';
});
/// LOAN BUTTON-ENDS

btnSort.addEventListener('click', function (e) {
  console.log('click');
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// LOGOUT
btnLogout.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = [];
  loginDisplay.classList.remove('hidden');
});
