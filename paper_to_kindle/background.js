chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadAndEmail') {
    handleDownloadAndEmail(request.paperInfo, sender.tab.id);
  }
});

async function handleDownloadAndEmail(paperInfo, tabId) {
  try {
    // Get settings
    const settings = await chrome.storage.sync.get(['toEmail', 'fromEmail', 'sendgridApiKey']);
    
    if (!settings.toEmail || !settings.fromEmail || !settings.sendgridApiKey) {
      throw new Error('Please configure email settings first');
    }

    // Download the paper
    const response = await fetch(paperInfo.pdfUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'same-origin'
    });
    const pdfBuffer = await response.arrayBuffer();
    const base64Pdf = arrayBufferToBase64(pdfBuffer);
    
    const filename = `${paperInfo.title}.pdf`;

    // Prepare SendGrid email
    const emailData = {
      personalizations: [{
        to: [{ email: settings.toEmail }]
      }],
      from: { 
        email: settings.fromEmail, 
        name: "ArXiv Paper Emailer" 
      },
      subject: `ArXiv Paper: ${paperInfo.title}`,
      content: [{
        type: "text/plain",
        value: `Attached is your requested paper: ${paperInfo.title}`
      }],
      attachments: [{
        content: base64Pdf,
        filename: filename,
        type: "application/pdf",
        disposition: "attachment"
      }]
    };

    // Send email using SendGrid API
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.sendgridApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailData),
      mode: 'cors'
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`SendGrid API error: ${errorText}`);
    }

    // Notify content script of success
    chrome.tabs.sendMessage(tabId, { action: 'sendComplete', success: true });

    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon_128x128.png',
      title: 'Success',
      message: 'Paper has been sent to your Kindle email!'
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Notify content script of failure
    chrome.tabs.sendMessage(tabId, { action: 'sendComplete', success: false });

    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon_128x128.png',
      title: 'Error',
      message: error.message || 'Failed to send paper. Please try again.'
    });
  }
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
