function addSendToKindleLink() {
  // Find the Download section element
  const pdfLink = document.querySelector('a.download-pdf');
  if (!pdfLink) return;

  // Create the new "Send to Kindle" link with similar styling
  const sendToKindleLink = document.createElement('a');
  sendToKindleLink.href = '#';
  sendToKindleLink.className = 'abs-button send-to-kindle';
  sendToKindleLink.textContent = 'Send to Kindle';
  sendToKindleLink.style.marginLeft = '10px';
  
  // Add click handler
  sendToKindleLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const paperInfo = {
      title: getPaperTitle(),
      pdfUrl: getPdfLink()
    };
    sendToKindleLink.textContent = 'Sending...';
    sendToKindleLink.style.opacity = '0.7';
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'downloadAndEmail',
      paperInfo: paperInfo
    });

    // Reset the button after 2 seconds
    setTimeout(() => {
      sendToKindleLink.textContent = 'Send to Kindle';
      sendToKindleLink.style.opacity = '1';
    }, 2000);
  });

  // Insert the new link after the PDF link
  pdfLink.parentNode.insertBefore(sendToKindleLink, pdfLink.nextSibling);
}

function getPaperTitle() {
  const titleElement = document.querySelector('h1.title');
  return titleElement ? titleElement.textContent.replace('Title:', '').trim() : null;
}

function getPdfLink() {
  const pdfLink = document.querySelector('a.download-pdf');
  return pdfLink ? pdfLink.href : null;
}

// Initialize when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addSendToKindleLink);
} else {
  addSendToKindleLink();
}

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
  .send-to-kindle {
    display: inline-block;
    padding: 5px 10px;
    background-color: #097;
    color: white !important;
    text-decoration: none;
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  .send-to-kindle:hover {
    background-color: #0b8;
    text-decoration: none;
  }
  .send-to-kindle:active {
    transform: translateY(1px);
  }
`;
document.head.appendChild(style);

// Listen for responses from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendComplete') {
    const sendToKindleLink = document.querySelector('.send-to-kindle');
    if (sendToKindleLink) {
      if (message.success) {
        sendToKindleLink.textContent = 'Sent!';
        setTimeout(() => {
          sendToKindleLink.textContent = 'Sent to Kindle';
        }, 2000);
      } else {
        sendToKindleLink.textContent = 'Error - Try Again';
        setTimeout(() => {
          sendToKindleLink.textContent = 'Send to Kindle';
        }, 2000);
      }
    }
  }
});
