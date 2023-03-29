// console.log("Does this even run?");

function runScript() {
  // console.log("Dom content laoded?");
  /* https://learn.stoa.com/c/c10-prompts/
  This is how the prompts in the URL looks
  */

  const pathname = document.location.pathname;
  const isPrompts = pathname === "/c/c10-prompts/" ? true : false;

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
      Just doing the sprints in order right now.

      Not handling these:
      1. Product Growth | Session 1 on Saturday
      2. Make Your Dream Team at Stoa
      3. Sprint | Recap and Recommendation
    */

    const promptsLinks = {};

    for (let { title, link } of linksMetadata) {
      if (title.indexOf("Day") !== -1) {
        let sprintName;
        // Cut of sprint names from title irrespective of "|" or  "l"
        sprintName = title.split("Day")[0].trim().slice(0, -2).toLowerCase();
        let promptName = null;
        let day = null;
        if (title.indexOf(":") !== -1) {
          day = title
            .split(":")[0]
            .split(" ")
            .slice(-2)
            .join(" ")
            .toLowerCase();
          promptName = title.split(":").slice(-1)[0].trim().toLowerCase();
        } else {
          // TODO: Not doing right now
          // This would be something other than the prompts
          // promptName = title.split("|")[1].trim();
        }

        // console.log(`${sprintName} ${day ?? ""} ${promptName}`);

        // Store to localStorage
        /* 
         sprintName : {
          day1 : link_to_prompt,
          day2 : link_to_prompt,
          ... and so on
         }
        */

        if (!promptsLinks[sprintName]) {
          // console.log("Adding new " + sprintName);
          promptsLinks[sprintName] = {
            [day]: {
              promptName,
              link,
            },
          };
        } else {
          // console.log("Updating " + sprintName);
          promptsLinks[sprintName] = {
            ...promptsLinks[sprintName],
            [day]: {
              promptName,
              link,
            },
          };
        }
      }
    }

    // console.log(promptsLinks)

    // Store locally the links for navigation later.
    chrome.storage.local.set({ promptsLinks });
    console.log("links set!");
  } else {
    console.log("Not the prompts page");
    // TODO: Need to refactor this into something better
    setTimeout(modifyHtml, 10000);
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
    // If it's not the prompts main page. Add button here
    console.log("URL changed");
    const pathname = document.location.pathname.toLowerCase();
    const isPrompts = pathname === "/c/c10-prompts/" ? true : false;

    // If its the main prompts page then run the scripts to store all links again.
    if (isPrompts) {
      runScript();
    } else {
      // TODO: Need to refactor this into something better
      setTimeout(modifyHtml, 10000);
    }
  }
});

function modifyHtml() {
  // console.log(`Path is ${document.location.pathname}}`);
  const pathname = document.location.pathname.toLowerCase();
  // remove the first 'c/c10-prompts'
  // so we are left with sprintname-day-promptname
  const actualPath = pathname.split("/").slice(3)[0];
  const sprintName = actualPath.split("day")[0].split("-").join(" ").trim();
  const promptName = actualPath
    .split("day")[1]
    .split("-")
    .join(" ")
    .trim()
    .slice(2);
  const [day] = pathname.match(/day-\d/);

  // console.log(`${sprintName} -> ${day} -> ${promptName}`);

  chrome.storage.local
    .get("promptsLinks")
    .then((results) => {
      for (let sprint in results.promptsLinks) {
        // console.log(sprint.toLowerCase(), sprintName, )
        if (sprint.toLowerCase() === sprintName) {
          let links = results.promptsLinks[sprint];
          // console.log(day.toLowerCase());
          // console.log(links)

          // Get where to add the buttons
          const mainWrapper = document.querySelector(".trix-content");

          // Make them buttons
          const prevButton = document.createElement("a");
          prevButton.innerText = "Prev";
          prevButton.className = "member-tags--label";
          prevButton.style.cursor = "pointer";
          prevButton.id = "prev";

          const nextButton = document.createElement("a");
          nextButton.innerText = "Next";
          nextButton.className = "member-tags--label";
          nextButton.style.cursor = "pointer";
          nextButton.id = "next";

          const buttonWrapper = document.createElement("div");
          buttonWrapper.style.display = "flex";
          buttonWrapper.style.justifyContent = "space-between";
          buttonWrapper.style.margin = "1rem 0";

          let prevHref, nextHref;
          // Add buttons
          switch (day.toLowerCase()) {
            case "day-2": {
              // console.log("day 2 today");
              prevHref = links["day 1"].link;
              nextHref = links["day 3"].link;
              break;
            }
            case "day-3": {
              prevHref = links["day 2"].link;
              nextHref = links["day 4"].link;
              // console.log("day 3 today");
              break;
            }
            case "day-4": {
              prevHref = links["day 3"].link;
              nextHref = links["day 5"].link;
              // console.log("day 4 today");
              break;
            }
            case "day-1": {
              prevHref = "#";
              nextHref = links["day 2"].link;
              // console.log("day 1 today");
              break;
            }
            case "day-5": {
              prevHref = links["day 4"].link;
              nextHref = "#";
              // console.log("day 5 today");
              break;
            }
            default: {
              console.log("No date in Day X");
            }
          }

          prevButton.href = prevHref;
          nextButton.href = nextHref;

          if (prevHref !== "#") {
            // console.log("oprev button shows");
            buttonWrapper.appendChild(prevButton);
          }

          if (nextHref !== "#") {
            // console.log("next button shows");
            buttonWrapper.appendChild(nextButton);
          }

          mainWrapper.parentNode.insertBefore(
            buttonWrapper,
            mainWrapper.nextSibling
          );

          break;
        }
      }
      // console.log("Couldnt find the sprintName " + sprintName);
    })
    .catch((e) =>
      console.log(e, "Something went wrong while fetching from local")
    );
}
