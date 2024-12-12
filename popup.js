// Save Flaresolverr endpoint to storage
document.getElementById('saveButton').addEventListener('click', () => {
    const flaresolverrEndpoint = document.getElementById('flaresolverrEndpoint').value;
    chrome.storage.sync.set({ flaresolverrEndpoint }, () => {
      console.log('Flaresolverr endpoint saved:', flaresolverrEndpoint);
      const messageElement = document.getElementById('message');
      messageElement.textContent = 'Endpoint saved!';
    });
  });
  
  // Load Flaresolverr endpoint from storage on popup load
  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get({ flaresolverrEndpoint: 'http://localhost:8191/v1' }, (data) => {
      document.getElementById('flaresolverrEndpoint').value = data.flaresolverrEndpoint;
    });
  });
  
  // Test Flaresolverr functionality
  document.getElementById('testButton').addEventListener('click', async () => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Fetching...';
  
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'fetchWithFlaresolverr',
        url: 'https://www.example.com', // Replace with the URL you want to test
        options: {},
      });
  
      if (response) {
        messageElement.textContent = 'Success!';
        console.log('Flaresolverr response:', response);
      } else {
        messageElement.textContent = 'Failed to get a response. Check console for errors.';
      }
    } catch (error) {
      console.error('Error:', error);
      messageElement.textContent = 'An error occurred.';
    }
  });