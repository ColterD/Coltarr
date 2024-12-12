const FLARESOLVERR_ENDPOINT_KEY = 'flaresolverrEndpoint';
const DEFAULT_FLARERESOLVERR_ENDPOINT = 'http://localhost:8191/v1';
const BLACKLIST_KEY = 'blacklist';

// Function to handle communication with Flaresolverr
async function fetchWithFlaresolverr(url, options) {
  try {
    const flaresolverrEndpoint = await getFlaresolverrEndpoint();
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
      console.error(`Flaresolverr error (status: ${flaresolverrResponse.status}, text: ${flaresolverrResponse.statusText}) for URL: ${url}`);
      return null;
    }
  } catch (error) {
    console.error('Error connecting to Flaresolverr:', error, 'for URL:', url);
    return null;
  }
}

// Get Flaresolverr endpoint from storage
function getFlaresolverrEndpoint() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ [FLARERESOLVERR_ENDPOINT_KEY]: DEFAULT_FLARERESOLVERR_ENDPOINT }, (data) => {
      resolve(data[FLARERESOLVERR_ENDPOINT_KEY]);
    });
  });
}

// Get the blacklist from storage
function getBlacklist() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ [BLACKLIST_KEY]: [] }, (data) => {
      resolve(data[BLACKLIST_KEY]);
    });
  });
}

// Add a site to the blacklist
async function addSiteToBlacklist(site) {
  const blacklist = await getBlacklist();
  if (!blacklist.includes(site)) {
    blacklist.push(site);
    await chrome.storage.sync.set({ [BLACKLIST_KEY]: blacklist });
    await updateRules();
  }
}

// Remove a site from the blacklist
async function removeSiteFromBlacklist(site) {
  const blacklist = await getBlacklist();
  const index = blacklist.indexOf(site);
  if (index > -1) {
    blacklist.splice(index, 1);
    await chrome.storage.sync.set({ [BLACKLIST_KEY]: blacklist });
    await updateRules();
  }
}

// Usage of fetchWithFlaresolverr
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchWithFlaresolverr') {
    fetchWithFlaresolverr(request.url, request.options)
      .then(data => sendResponse(data))
      .catch(error => {
        console.error('Error in fetchWithFlaresolverr:', error);
        sendResponse(null);
      });
    return true; // Keep the message channel open
  } else if (request.action === 'addSiteToBlacklist') {
    addSiteToBlacklist(request.site).then(() => sendResponse({ success: true }));
    return true;
  } else if (request.action === 'removeSiteFromBlacklist') {
    removeSiteFromBlacklist(request.site).then(() => sendResponse({ success: true }));
    return true;
  } else if (request.action === 'getBlacklist') {
    getBlacklist().then(blacklist => sendResponse(blacklist));
    return true; // Keep the message channel open
  }
});

// Get the next available rule ID
async function getNextAvailableRuleId() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  const usedIds = new Set(rules.map(rule => rule.id));
  let nextId = 1;
  while (usedIds.has(nextId)) {
    nextId++;
  }
  return nextId;
}

// Update declarativeNetRequest rules based on the blacklist
async function updateRules() {
  try {
    const blacklist = await getBlacklist();
    const nextRuleId = await getNextAvailableRuleId();

    // Remove old rules
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(rule => rule.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
    });

    // Create new rules from the blacklist
    const newRules = blacklist.map((site, index) => ({
      id: nextRuleId + index,
      priority: 1,
      action: { type: 'block' },
      condition: { urlFilter: `*://*.${site}/*` },
    }));

    // Add new rules
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules });

    console.log("Rules updated successfully");
  } catch (error) {
    console.error("Error updating rules:", error);
  }
}

// Initial rule update on extension startup
updateRules();