// Function to handle communication with Flaresolverr
async function fetchWithFlaresolverr(url, options) {
    try {
      const flaresolverrEndpoint = await getFlaresolverrEndpoint(); // Get endpoint from storage
      const flaresolverrResponse = await fetch(flaresolverrEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cmd: 'request.get',
          url: url,
          maxTimeout: 60000,
          ...options,
        }),
      });
  
      if (flaresolverrResponse.ok) {
        const data = await flaresolverrResponse.json();
        return data;
      } else {
        console.error('Flaresolverr error:', flaresolverrResponse.status, flaresolverrResponse.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error connecting to Flaresolverr:', error);
      return null;
    }
  }
  
  // Get Flaresolverr endpoint from storage
  function getFlaresolverrEndpoint() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ flaresolverrEndpoint: 'http://localhost:8191/v1' }, (data) => {
        resolve(data.flaresolverrEndpoint);
      });
    });
  }
  
  // Example usage of fetchWithFlaresolverr
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchWithFlaresolverr') {
      fetchWithFlaresolverr(request.url, request.options)
        .then(data => sendResponse(data))
        .catch(error => {
          console.error('Error in fetchWithFlaresolverr:', error);
          sendResponse(null); // Send null to indicate failure
        });
      return true; // Keep the message channel open for the async response
    }
  });
  
  // Example of using declarativeNetRequest with unique rule IDs
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], // Remove existing rules if needed
    addRules: [
      {
        id: 1,
        priority: 1,
        action: { type: 'block' },
        condition: { urlFilter: '*://*.example.com/*' }, // Block requests to example.com
      },
      {
        id: 2,
        priority: 1,
        action: { type: 'allow' },
        condition: { urlFilter: '*://*.anothersite.com/*' }, // Allow requests to anothersite.com
      },
      // Add more rules with unique IDs as needed
    ],
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error updating rules:", chrome.runtime.lastError);
    } else {
      console.log("Rules updated successfully");
    }
  });
  
  // Example of interacting with a tab, ensuring it exists
  chrome.action.onClicked.addListener(async (tab) => {
    try {
      const existingTab = await chrome.tabs.get(tab.id);
      if (existingTab) {
        // Perform actions on the existing tab
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            console.log("Script executed on tab:", tab.id);
          }
        });
      }
    } catch (error) {
      console.error("Error interacting with tab:", error);
    }
  });