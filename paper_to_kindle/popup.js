document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['toEmail', 'fromEmail', 'sendgridApiKey'], function(items) {
    document.getElementById('toEmail').value = items.toEmail || '';
    document.getElementById('fromEmail').value = items.fromEmail || '';
    document.getElementById('apiKey').value = items.sendgridApiKey || '';
  });

  // Save settings
  document.getElementById('save').addEventListener('click', function() {
    const toEmail = document.getElementById('toEmail').value;
    const fromEmail = document.getElementById('fromEmail').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!toEmail || !fromEmail || !apiKey) {
      const status = document.getElementById('status');
      status.style.color = '#f44336';
      status.textContent = 'Please fill in all fields';
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail) || !emailRegex.test(fromEmail)) {
      const status = document.getElementById('status');
      status.style.color = '#f44336';
      status.textContent = 'Please enter valid email addresses';
      return;
    }

    chrome.storage.sync.set({
      toEmail: toEmail,
      fromEmail: fromEmail,
      sendgridApiKey: apiKey
    }, function() {
      const status = document.getElementById('status');
      status.style.color = '#4CAF50';
      status.textContent = 'Settings saved!';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    });
  });
});

