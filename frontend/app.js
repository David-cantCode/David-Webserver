// Simple view switcher
const buttons = document.querySelectorAll('nav button');
const views = { home: document.getElementById('home'),
                terminal: document.getElementById('terminal-view'),
                about: document.getElementById('about') };

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const app = btn.dataset.app;
    Object.values(views).forEach(v => v.classList.remove('active'));
    if (views[app]) views[app].classList.add('active');
    // focus terminal input when opening terminal
    if (app === 'terminal') document.getElementById('cmd').focus();
  });
});

// Terminal functionality
const output = document.getElementById('output');
const cmdInput = document.getElementById('cmd');

// Helper to append line to terminal
function appendLine(text) {
  output.textContent += text + "\n";
  output.parentElement.scrollTop = output.parentElement.scrollHeight;
}

cmdInput.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  const cmd = cmdInput.value.trim();
  if (!cmd) return;
  appendLine('> ' + cmd);
  cmdInput.value = '';

  try {
    // send command to /run
  fetch("/run", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "mysecret\n" + cmd
  });


    if (!res.ok) {
      const err = await res.text();
      appendLine('[error] ' + (err || res.statusText));
      return;
    }

    // receive full output as text (simple approach)
    const text = await res.text();
    appendLine(text.trim());
  } catch (err) {
    appendLine('[network] ' + err.message);
  }
});
