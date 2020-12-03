import { STORAGE_KEYS } from "../globals.js"
import { getStorageItem } from "../utils/chromeStorage.js"

let startVideo = false

export default async function setupAutoplay() {
  const autoplay = await getStorageItem(STORAGE_KEYS.AUTOPLAY)
  if (!autoplay) return
  console.log(localStorage.getItem("wistia-video-progress-mq75g1wjtb"))
  const nextButton = getNextButton()
  const video = await getVideo()

  if (startVideo) {
    const playButton = await getPlayButton()
    console.log(playButton)
    playButton.click()
  }
  startVideo = false

  video.addEventListener("ended", () => {
    startVideo = true
    nextButton.click()
  })
}

function getNextButton() {
  const courseButtons = [
    ...document.querySelectorAll(".user-course-pager a[data-block-id]")
  ]

  return courseButtons.find(button => {
    return (
      button.textContent.includes("Next") || button.textContent.includes("→")
    )
  })
}

function getPlayButton() {
  const button =
    document.querySelector(".w-big-play-button") || getResumeButton()
  if (button) return Promise.resolve(button)

  return new Promise(resolve => {
    const observer = new MutationObserver((mutationList, o) => {
      mutationList.forEach(mutation => {
        if (
          mutation.type === "childList" &&
          (mutation.target.matches(".w-big-play-button") ||
            mutation.textContent.includes("Skip to where you left off"))
        ) {
          o.disconnect()
          resolve(mutation.target)
        }
      })
    })
    observer.observe(document.querySelector(".wistia_embed"), {
      subtree: true,
      childList: true
    })
  })
}

function getResumeButton() {
  const buttons = [...document.querySelectorAll("w-chrome a")]
  return buttons.find(button => {
    return button.textContent.includes("Skip to where you left off")
  })
}

function getVideo() {
  const video = document.querySelector(".w-video-wrapper > video")
  if (video) return Promise.resolve(video)

  return new Promise(resolve => {
    const observer = new MutationObserver((mutationList, o) => {
      mutationList.forEach(mutation => {
        if (mutation.type === "childList" && mutation.target.matches("video")) {
          o.disconnect()
          resolve(mutation.target)
        }
      })
    })
    observer.observe(document.querySelector(".wistia_embed"), {
      subtree: true,
      childList: true
    })
  })
}

// TODO: I can get the wistia information from local storage. I can also get the ID of the element from the wistia div id
// It may have a 1 appended to the end for some reason
// Do some trickery to check which of the two buttons for playing the video I should load
