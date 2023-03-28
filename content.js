// console.log("Does this even run?");

const pathname = document.location.pathname;
const isPrompts = pathname === "/c/c10-prompts/" ? true : false;

function runScript() {
  // console.log("Dom content laoded?");
  /* https://learn.stoa.com/c/c10-prompts/
  This is how the prompts in the URL looks
  */

  if (isPrompts) {
    // Find the posts
    let posts = Array.from(
      document.getElementsByClassName("infinite-scroll-component")[0].children
    );

    // Get the titles that are loaded
    const linksMetadata = posts.map((post, index) => {
      const title =
        post.children[0].children[1].children[0].children[0].innerText;
      // console.log(` ${index} - ${title}`);
      const link =
        post.children[0].children[1].children[0].children[0].children[0]
          .children[0].href;
      return {
        title,
        link,
      };
    });

    // Store them to local stoarge under their own sprints?
    // We know there are 5 articles in every Sprint.
    /*
      The types of titles so far are : 
      1. [SPRINT-NAME] | [DAY-X]: [TITLE-OF-THE-PROMPT]
      2. [SPRINT-NAME] | Recap and Recommendation
      3. [SPRINT-NAME] | Case Breif and more
      3. Something random


      Not handling these:
      Product Growth | Session 1 on Saturday
      Make Your Dream Team at Stoa
      Sprint | Recap and Recommendation
    */
    for (let { title, link } of linksMetadata) {
      // Some of the links have a 'l' instead of '|'
      if (title.indexOf("Day") !== -1) {
        let sprintName;
        sprintName = title.split("Day")[0].trim().split(" ")[0];
        let promptName = null;
        let day = null;
        console.log(title.split);
        if (title.indexOf(":") !== -1) {
          day = title.split(":")[0].split(" ").slice(-2).join(" ");
          promptName = title.split(":").slice(-1)[0].trim();
        } else {
          // This would be something other than the prompts
          promptName = title.split("|")[1].trim();
        }

        console.log(`${sprintName} ${day ?? ""} ${promptName}`);
      } else {
        console.log(`${link} ${title}`);
      }
    }
  } else {
    console.log("Not the prompts page");
  }
}

// wait initially to load all data
setTimeout(() => {
  runScript();
}, 10000);

// hear for the click on the popup and then again populate the storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "runScript") {
    runScript();
  }
});

// Run this whenever the URL Changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "urlChanged") {
    modifyHtml();

    // If its the main prompts page then run the scripts to store all links again.
    if (isPrompts) {
      runScript();
    }
  }
});

function modifyHtml() {
  console.log("Now add buttons here!", document.location.pathname);
}
