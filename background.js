// Listen to url changes in the BG
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    currentUrl = changeInfo.url;
    chrome.tabs.sendMessage(tabId, { action: "urlChanged" });
  }
});

