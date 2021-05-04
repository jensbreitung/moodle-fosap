// global variables
const listener_timeout = 3000;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const eval = document.getElementById("eval_homework");
    eval.addEventListener("click", () => {
      chrome.tabs.executeScript({ file: "func/moodle/eval.js" });
    });
  },
  false
);

const exec_js_on_page = (
  unique_elem_id,
  page,
  file_to_exec,
  listener_timeout
) => {
  const elem = document.getElementById(unique_elem_id);
  elem.addEventListener(
    "click",
    () => {
      chrome.tabs.update({ url: page }, function () {
        function generic_listener(tabId, changeInfo, tab) {
          if (changeInfo.status == "complete") {
            chrome.tabs.executeScript(tabId, { file: file_to_exec });
          }
          // remove the listener after listener_timeout
          setTimeout(function () {
            chrome.tabs.onUpdated.removeListener(generic_listener);
          }, listener_timeout);
        }
        chrome.tabs.onUpdated.addListener(generic_listener);
      });
    },
    false
  );
};

const get_current_tab_id = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log(tabs);
    var currTab = tabs[0];
    if (currTab) {
      console.log("we got here");
      return currTab.index;
    }
    throw "No valid tab";
    return -1;
  });
};
