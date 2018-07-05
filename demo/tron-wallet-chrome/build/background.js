var isCreated=false;
var _window=null;

chrome.windows.onRemoved.addListener(function(win){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {action: "open_dialog_box",w:win,ww:_window}, function(response) {});  
  });
  if(_window.id==win){
    _window=null;
    isCreated=false;
  }
}); 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if(!isCreated && (request.message == 'deploy_contract'||request.message == 'open_wallet')){
    var _type=request.message;
    setTimeout(function(){

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: "pass_message", type:_type}, function(response) {});  
      });

    },1000);
   
    chrome.windows.create({
      url: chrome.runtime.getURL("index.html"),
      width:500,
      height:600,
      left:100,
      top:100,
      type: "popup",
      setSelfAsOpener:true
    },function(win){
       _window=win;
    });
    isCreated=true;
  };
 
})
