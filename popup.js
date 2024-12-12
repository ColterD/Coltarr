const messageElement = document.getElementById('message');
const flaresolverrEndpointInput = document.getElementById('flaresolverrEndpoint');
const saveButton = document.getElementById('saveButton');
const testButton = document.getElementById('testButton');
const addButton = document.getElementById('addButton');
const newBlacklistItemInput = document.getElementById('newBlacklistItem');
const blacklistElement = document.getElementById('blacklist');

// Save Flaresolverr endpoint to storage
saveButton.addEventListener('click', () => {
  const flaresolverrEndpoint = flaresolverrEndpointInput.value.trim();
  if (flaresolverrEndpoint) {
    chrome.storage.sync.set({ flaresolverrEndpoint }, () => {
      console.log('Flaresolverr endpoint saved:', flaresolverrEndpoint);
      displayMessage('Endpoint saved successfully!', 'success');
    });
  } else {
    displayMessage('Please enter a valid endpoint.', 'error');
  }
});

// Test Flaresolverr endpoint
testButton.addEventListener('click', async () => {
  const flaresolverrEndpoint = flaresolverrEndpointInput.value.trim();
  if (!flaresolverrEndpoint) {
    displayMessage('Please enter a Flaresolverr endpoint to test.', 'error');
    return;
  }

  displayMessage(`Testing endpoint: ${flaresolverrEndpoint}...`, 'info');

  try {
    // Use a HEAD request to check if the server is reachable
    const response = await fetch(flaresolverrEndpoint, { method: 'HEAD' });

    if (response.ok) {
      displayMessage(`Test successful! Flaresolverr is reachable at ${flaresolverrEndpoint}.`, 'success');
    } else {
      displayMessage(`Test failed. Flaresolverr responded with status: ${response.status}`, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    displayMessage(`Error: Could not connect to Flaresolverr at ${flaresolverrEndpoint}.`, 'error');
  }
});

// Add a site to the blacklist
addButton.addEventListener('click', async () => {
  const newSite = newBlacklistItemInput.value.trim();
  if (newSite) {
    try {
      await chrome.runtime.sendMessage({ action: 'addSiteToBlacklist', site: newSite });
      newBlacklistItemInput.value = '';
      loadBlacklist();
      displayMessage('Site added to blacklist.', 'success');
    } catch (error) {
      console.error('Error adding site to blacklist:', error);
      displayMessage('Error adding site to blacklist.', 'error');
    }
  }
});

// Function to remove a site from the blacklist
async function removeSite(site) {
  try {
    await chrome.runtime.sendMessage({ action: 'removeSiteFromBlacklist', site: site });
    loadBlacklist();
    displayMessage('Site removed from blacklist.', 'success');
  } catch (error) {
    console.error('Error removing site from blacklist:', error);
    displayMessage('Error removing site from blacklist.', 'error');
  }
}

// Load and display the blacklist
async function loadBlacklist() {
  const blacklist = await chrome.runtime.sendMessage({ action: 'getBlacklist' });
  const listElement = document.getElementById('blacklist');
  listElement.innerHTML = '';
  blacklist.forEach(site => {
    const listItem = document.createElement('li');
    listItem.className = 'list-item';
    listItem.textContent = site;
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-btn';
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', () => removeSite(site));
    listItem.appendChild(removeButton);
    listElement.appendChild(listItem);
  });
}

// Load Flaresolverr endpoint from storage on popup load
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['flaresolverrEndpoint'], (data) => {
    if (data.flaresolverrEndpoint) {
      flaresolverrEndpointInput.value = data.flaresolverrEndpoint;
    }
  });
  loadBlacklist();
});

// Function to display messages to the user
function displayMessage(message, type) {
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');

  // Set different colors based on message type
  if (type === 'success') {
    messageElement.style.backgroundColor = '#d4edda';
    messageElement.style.borderColor = '#c3e6cb';
    messageElement.style.color = '#155724';
  } else if (type === 'error') {
    messageElement.style.backgroundColor = '#f8d7da';
    messageElement.style.borderColor = '#f5c6cb';
    messageElement.style.color = '#721c24';
  } else {
    messageElement.style.backgroundColor = '#dae8fc';
    messageElement.style.borderColor = '#c7d9f8';
    messageElement.style.color = '#0c5460';
  }

  // Automatically hide the message after 5 seconds
  setTimeout(() => {
    messageElement.textContent = '';
    messageElement.classList.add('hidden');
  }, 5000);
}