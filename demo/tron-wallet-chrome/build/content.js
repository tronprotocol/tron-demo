var installNode = document.createElement('div');
console.log("content running");
installNode.id = 'my-chrome-extension-installed';
installNode.style.display = 'none';
installNode.innerText="Deploy Contract"; 
document.body.appendChild(installNode);

installNode.addEventListener('open_wallet', function(evt) {
  console.log(evt.target.innerText);
  chrome.runtime.sendMessage({message: 'open_wallet'}, function() { });
});

installNode.addEventListener('deploy_contract', function(evt) {
  console.log(evt.target.innerText);
  chrome.runtime.sendMessage({message: 'deploy_contract'}, function() { });
});

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'open_dialog_box') {
    console.log(msg);
  }
});