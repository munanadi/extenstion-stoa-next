// Click should retrigger functions in content to update the links
document.getElementById('button').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'runScript' });
  });
});