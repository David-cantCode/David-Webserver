const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const historyEl = document.getElementById('history');
const modeLabel = document.getElementById('modeLabel');
let expression = '';
let mode = 'RAD'; // RAD or DEG

function appendKey(key) {
  if (key === 'C') {
    expression = '';
    resultEl.textContent = '';
  } else if (key === '=') {
    calculate();
  } else {
    expression += key === '^' ? '**' : key;
  }
  expressionEl.textContent = expression;
}

function calculate() {
  try {
    let exp = expression
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/ln/g, 'Math.log')
      .replace(/log/g, 'Math.log10');

    if (mode === 'DEG') {
      exp = exp.replace(/Math\.sin\((.*?)\)/g, (_, x) => `Math.sin((${x}) * Math.PI / 180)`);
      exp = exp.replace(/Math\.cos\((.*?)\)/g, (_, x) => `Math.cos((${x}) * Math.PI / 180)`);
      exp = exp.replace(/Math\.tan\((.*?)\)/g, (_, x) => `Math.tan((${x}) * Math.PI / 180)`);
    }

    const result = eval(exp);
    resultEl.textContent = result;
    const histEntry = document.createElement('div');
    histEntry.textContent = `${expression} = ${result}`;
    historyEl.prepend(histEntry);
    expression = '';
  } catch {
    resultEl.textContent = 'Error';
  }
}

document.querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', () => {
    appendKey(btn.dataset.key);
  });
});

// Toggle between radians and degrees
const toggleMode = document.getElementById('toggleMode');
toggleMode.addEventListener('click', () => {
  mode = mode === 'RAD' ? 'DEG' : 'RAD';
  modeLabel.textContent = mode;
});

// Clear history
const clearHistory = document.getElementById('clearHistory');
clearHistory.addEventListener('click', () => {
  historyEl.innerHTML = '';
});
