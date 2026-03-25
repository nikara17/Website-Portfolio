
// ================= TAB NAVIGATION =================
// Handles switching between About / Skills / Education tabs

const tabLinks = document.querySelectorAll(".tab-links");
const tabContents = document.querySelectorAll(".tab-contents");

function openTab(clickedTab, tabName) {
  // Remove active states
  tabLinks.forEach(link => link.classList.remove("active-link"));
  tabContents.forEach(content => content.classList.remove("active-tab"));

  // Activate selected tab
  clickedTab.classList.add("active-link");

  const activeContent = document.getElementById(tabName);
  if (activeContent) {
    activeContent.classList.add("active-tab");
  }
}

// Attach click events to each tab
tabLinks.forEach(tab => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;

    // Switch tab
    openTab(tab, tabName);

    // Trigger slideshow (IMPORTANT)
    startSlideshow(tabName);
  });

});

// ================= SHARED SECURITY HELPERS =================
const escapeHTML = (str = "") =>
  String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));


// ================= BASIC ANTI-SPAM TIMING =================
const pageLoadTime = Date.now();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastContactSubmit = 0;
const CONTACT_COOLDOWN_MS = 15000;

let lastReviewSubmit = 0;
const REVIEW_COOLDOWN_MS = 15000;


// ================= HERO TYPEWRITER =================
// Animates bullet points in the hero section

const typingElement = document.getElementById("typing-text");

const bulletLines = [
  " AI Systems • Robotics • Intelligent Software",
  " Data-Driven Solutions · Automation · Intelligent Systems"
];

// Only run on desktop + if element exists
if (typingElement && window.innerWidth > 768 && !prefersReducedMotion) {
  let lineIndex = 0;
  let charIndex = 0;

  function typeBullets() {
    if (lineIndex >= bulletLines.length) return;

    const currentLine = bulletLines[lineIndex];

    if (charIndex < currentLine.length) {
      typingElement.append(currentLine.charAt(charIndex));
      charIndex++;
      setTimeout(typeBullets, 20);
    } else {
      typingElement.append(document.createElement("br"));
      lineIndex++;
      charIndex = 0;
      setTimeout(typeBullets, 150);
    }
  }

  typeBullets();
}



// ================= ABOUT TITLE ANIMATION =================
// Triggers animation when About section enters viewport

const aboutSection = document.getElementById("about");
const aboutTitle = document.querySelector(".about-title");

if (aboutSection && aboutTitle) {
  const aboutObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutTitle.classList.add("about-visible");

        // Stop observing after animation runs once
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05
  });

  aboutObserver.observe(aboutSection);
}



// ================= ABOUT ACCORDION =================
// Handles accordion toggle (only one open at a time)

const accordionHeaders = document.querySelectorAll(".accordion-header");

if (accordionHeaders.length) {
  accordionHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const currentItem = header.closest(".accordion-item");
      if (!currentItem) return;

      document.querySelectorAll(".accordion-item").forEach(item => {
        if (item !== currentItem) {
          item.classList.remove("active");
        }
      });

      currentItem.classList.toggle("active");
    });
  });
}



// ================= ABOUT MEDIA SLIDESHOW =================
// Handles image/video slideshow based on active tab

const aboutContainer = document.querySelector(".about-media-stage");

const imageSets = {
  aboutme: [
    "images/about-me.png",
    "images/durban-vid.mp4",
    "images/indian-culture.png",
    "images/african-culture.png"
  ],
  skills: [
    "images/skills1.png",
    "images/skills2.png",
    "images/skills3.jpg",
    "images/skills4.png"
  ],
  education: [
    "images/edu1.png",
    "images/edu2.png",
    "images/edu3.png"
  ]
};

let slideTimeout = null;
let currentToken = 0;

// Clear any running slideshow timer
function clearSlideWork() {
  if (slideTimeout) {
    clearTimeout(slideTimeout);
    slideTimeout = null;
  }
}

// Create media element safely
function createMediaElement(src) {
  const isVideo = src.toLowerCase().endsWith(".mp4");

  if (isVideo) {
    const video = document.createElement("video");
    video.src = src;
    video.autoplay = true;
    video.muted = true;
    video.loop = false;
    video.playsInline = true;
    video.preload = "metadata";
    video.className = "about-media-item";
    return video;
  }

  const img = document.createElement("img");
  img.src = src;
  img.alt = "About slideshow image";
  img.loading = "lazy";
  img.className = "about-media-item";
  return img;
}

// Render media into container
function mountMedia(el, token) {
  if (!aboutContainer) return;

  aboutContainer.innerHTML = "";
  el.style.opacity = 0;
  aboutContainer.appendChild(el);

  requestAnimationFrame(() => {
    if (token !== currentToken) return;
    el.style.opacity = 1;
  });

  // Ensure video plays correctly
  if (el.tagName === "VIDEO") {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
}

// Start slideshow
function startSlideshow(tab) {
  if (!aboutContainer || prefersReducedMotion) return;

  const mediaList = imageSets[tab] || [];
  if (!mediaList.length) return;

  const token = ++currentToken;
  clearSlideWork();

  let index = 0;

  function nextSlide() {
    if (token !== currentToken) return;

    index = (index + 1) % mediaList.length;
    const media = createMediaElement(mediaList[index]);

    if (media.tagName === "VIDEO") {
      media.onended = () => {
        clearSlideWork();
        nextSlide();
      };

      slideTimeout = setTimeout(() => {
        nextSlide();
      }, 8000);
    } else {
      slideTimeout = setTimeout(nextSlide, 5000);
    }

    mountMedia(media, token);
  }

  const firstMedia = createMediaElement(mediaList[0]);

  if (firstMedia.tagName === "VIDEO") {
    firstMedia.onended = () => {
      clearSlideWork();
      nextSlide();
    };

    slideTimeout = setTimeout(() => {
      nextSlide();
    }, 8000);
  } else if (mediaList.length > 1) {
    slideTimeout = setTimeout(nextSlide, 5000);
  }

  mountMedia(firstMedia, token);
}


// ================= ABOUT SCROLL TRIGGER =================
// Starts slideshow when About section enters viewport (once)

let aboutStarted = false;
const aboutSectionEl = document.getElementById("about");

if (aboutSectionEl) {
  const aboutScrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || aboutStarted) return;

      aboutStarted = true;

      // Get currently active tab
      const activeTab = document.querySelector("#about .tab-contents.active-tab");
      const activeTabId = activeTab ? activeTab.id : "aboutme";

      // Start slideshow
      startSlideshow(activeTabId);

      // Stop observing after first trigger (performance)
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  aboutScrollObserver.observe(aboutSectionEl);
}



// ================= ABOUT READ MORE TOGGLE =================
// Expands/collapses extended About section text

const aboutReadMoreBtn = document.getElementById("aboutReadMoreBtn");
const aboutSummaryMore = document.getElementById("aboutSummaryMore");

if (aboutReadMoreBtn && aboutSummaryMore) {
  aboutReadMoreBtn.addEventListener("click", () => {

    const isExpanded = aboutSummaryMore.classList.toggle("show");

    // Update button text
    aboutReadMoreBtn.textContent = isExpanded
      ? "Show less"
      : "Continue reading";

  });
}


// ================= SKILLS DROPDOWN =================
// Handles toggle for skill sections (one open at a time)

const skillHeaders = document.querySelectorAll(".skill-header");

if (skillHeaders.length) {
  skillHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const currentDropdown = header.closest(".skill-dropdown");
      if (!currentDropdown) return;

      document.querySelectorAll(".skill-dropdown").forEach(dropdown => {
        if (dropdown !== currentDropdown) {
          dropdown.classList.remove("active");
        }
      });

      currentDropdown.classList.toggle("active");
    });
  });
}



// ================= EDUCATION DROPDOWN =================
// Toggles visibility of education dropdown sections

const eduHeaders = document.querySelectorAll(".edu-header");

if (eduHeaders.length) {
  eduHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const currentDropdown = header.closest(".edu-dropdown");
      if (!currentDropdown) return;

      currentDropdown.classList.toggle("active");
    });
  });
}


// ================= ABOUT TAB SWITCHING =================
// Handles About / Skills / Education tabs

const aboutTabLinks = document.querySelectorAll("#about .tab-links");
const aboutTabContents = document.querySelectorAll("#about .tab-contents");

function openTab(clickedTab, tabName) {
  aboutTabLinks.forEach(link => link.classList.remove("active-link"));
  aboutTabContents.forEach(content => content.classList.remove("active-tab"));

  clickedTab.classList.add("active-link");

  const targetTab = document.getElementById(tabName);
  if (targetTab) {
    targetTab.classList.add("active-tab");
  }
}

if (aboutTabLinks.length) {
  aboutTabLinks.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      if (!tabName) return;

      openTab(tab, tabName);
      startSlideshow(tabName);
    });
  });
}



// ================= JUMP TO TRANSCRIPT =================
// Open Education first, let layout settle, then do one smooth scroll

const jumpToTranscriptBtn = document.getElementById("jumpToTranscriptBtn");
const educationTabBtn = document.querySelector('.tab-links[data-tab="education"]');
const transcriptSection = document.getElementById("transcript");
const viewTranscriptBtn = document.getElementById("viewTranscriptBtn");
const academicStatsDropdown = document.getElementById("academicStatsDropdown");

// Smooth custom scroll helper
function smoothScrollToElement(target, duration = 1100, offset = -120, callback) {
  if (!target) return;

  const startPosition = window.pageYOffset;
  const targetPosition =
    target.getBoundingClientRect().top + window.pageYOffset + offset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;

    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startPosition + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animation);
    } else if (typeof callback === "function") {
      callback();
    }
  }

  requestAnimationFrame(animation);
}

if (
  jumpToTranscriptBtn &&
  educationTabBtn &&
  transcriptSection
) {
  jumpToTranscriptBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Reset temporary highlights
    educationTabBtn.classList.remove("tab-glow");
    if (viewTranscriptBtn) {
      viewTranscriptBtn.classList.remove("transcript-highlight");
    }

    // Open Education immediately
    educationTabBtn.classList.add("tab-glow");
    openTab(educationTabBtn, "education");
    startSlideshow("education");

    // Open Academic Stats immediately
    if (academicStatsDropdown) {
      academicStatsDropdown.classList.add("active");
    }

    // Wait for layout to settle before calculating scroll position
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        smoothScrollToElement(transcriptSection, 1100, -120, () => {
          if (viewTranscriptBtn) {
            viewTranscriptBtn.classList.add("transcript-highlight");

            setTimeout(() => {
              viewTranscriptBtn.classList.remove("transcript-highlight");
            }, 2400);
          }
        });
      });
    });

    // Remove Education tab glow after a moment
    setTimeout(() => {
      educationTabBtn.classList.remove("tab-glow");
    }, 900);
  });
}






// ================= CERTIFICATIONS TITLE ANIMATION =================
// Triggers animation when Certifications section enters viewport

const certSection = document.getElementById("certifications");
const certTitle = document.querySelector(".cert-title");

if (certSection && certTitle) {
  const certObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        certTitle.classList.add("cert-visible");

        // Stop observing after first trigger
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  certObserver.observe(certSection);
}





// ================= PORTFOLIO TITLE ANIMATION =================
// Triggers animation when portfolio title enters viewport

const portfolioTitle = document.querySelector(".portfolio-title");

if (portfolioTitle) {
  const portfolioObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        portfolioTitle.classList.add("portfolio-visible");

        // Stop observing after animation runs once
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  portfolioObserver.observe(portfolioTitle);
}



// ================= PROJECT SCROLLER =================
// Handles horizontal scroll for portfolio projects

const projectTrack = document.getElementById("projectTrack");
const projectsLeftBtn = document.getElementById("projectsLeftBtn");
const projectsRightBtn = document.getElementById("projectsRightBtn");

function scrollProjects(direction) {
  if (!projectTrack) return;

  const scrollAmount = 420;

  projectTrack.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });
}

// Attach events
if (projectsLeftBtn) {
  projectsLeftBtn.addEventListener("click", () => scrollProjects(-1));
}

if (projectsRightBtn) {
  projectsRightBtn.addEventListener("click", () => scrollProjects(1));
}







// ================= BLOG TITLE ANIMATION =================
// Triggers animation when blog title enters viewport

const blogsTitle = document.querySelector(".blogs-title");

if (blogsTitle) {
  const blogObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        blogsTitle.classList.add("type-visible");

        // Stop observing after first trigger
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  blogObserver.observe(blogsTitle);
}



// ================= BLOG INTRO ANIMATION =================
// Delayed animation for blog intro (syncs with title)

const blogsIntro = document.querySelector(".blogs-intro");

if (blogsIntro) {
  const introObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {

        // Delay to sync with title animation
        setTimeout(() => {
          blogsIntro.classList.add("intro-visible");
        }, 2000);

        // Stop observing after first trigger
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  introObserver.observe(blogsIntro);
}




// ================= BLOG PARALLAX =================
// Subtle parallax effect for blog cards on scroll

const blogScroll = document.querySelector(".blogs-right");
const blogCards = document.querySelectorAll(".blog-card");

if (blogScroll && blogCards.length) {

  let ticking = false;

  blogScroll.addEventListener("scroll", () => {

    // Throttle using requestAnimationFrame (performance)
    if (!ticking) {
      requestAnimationFrame(() => {

        // Disable on small screens
        if (window.innerWidth <= 900) {
          blogCards.forEach(card => {
            card.style.transform = "none";
          });
          ticking = false;
          return;
        }

        const scrollTop = blogScroll.scrollTop;

        blogCards.forEach((card, index) => {
          const speed = 0.07 + (index * 0.01);
          card.style.transform = `translateY(${scrollTop * speed * -1}px)`;
        });

        ticking = false;
      });

      ticking = true;
    }

  });
}






// ================= CONTACT FORM (GOOGLE SHEETS) =================
// Handles form submission, loading state, and user feedback

const CONTACT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyol0QDOTfeRDRviYT3xabOrnWV0kfcW8iCdIw1qCgUryalcLa0AEKzb045_U9mvzoDTA/exec";

const contactForm = document.forms["submit-to-google-sheet"];
const contactMsg = document.getElementById("msg");

const contactBtn =
  document.querySelector(".futuristic-btn") ||
  contactForm?.querySelector('button[type="submit"]');

const contactBtnText = contactBtn?.querySelector(".btn-text");

// ---------- Button State ----------
function setContactBtnLoading(loading) {
  if (!contactBtn) return;

  contactBtn.disabled = loading;
  contactBtn.style.opacity = loading ? "0.75" : "1";
  contactBtn.style.cursor = loading ? "not-allowed" : "pointer";

  if (contactBtnText) {
    contactBtnText.textContent = loading ? "Sending..." : "Send Message";
  }
}

// ---------- Message UI ----------
function showContactMessage(text, type = "success") {
  if (!contactMsg) return;

  contactMsg.className = "form-message";
  contactMsg.classList.add(type, "show");

  const safeText = escapeHTML(String(text || ""));
  const safeTitle =
    type === "success"
      ? "Sent"
      : type === "error"
      ? "Oops"
      : "Sending";

  const icon =
    type === "success"
      ? '<span class="msg-icon"><i class="fa-solid fa-check"></i></span>'
      : type === "error"
      ? '<span class="msg-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>'
      : '<span class="msg-icon"><i class="fa-solid fa-paper-plane"></i></span>';

  contactMsg.innerHTML = `
    ${icon}
    <span class="msg-text"><b>${safeTitle}:</b> ${safeText}</span>
  `;

  if (type !== "loading") {
    setTimeout(() => contactMsg.classList.remove("show"), 5000);
  }
}

// ---------- Form Submission ----------
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    setContactBtnLoading(true);

    const now = Date.now();

    // Honeypot check
    const hpField = contactForm.querySelector('input[name="Website"]');
    if (hpField && hpField.value.trim() !== "") {
      setContactBtnLoading(false);
      return;
    }

    // Minimum time-on-page check
    if (now - pageLoadTime < 3000) {
      showContactMessage("Please wait a moment before submitting.", "error");
      setContactBtnLoading(false);
      return;
    }

    // Cooldown check
    if (now - lastContactSubmit < CONTACT_COOLDOWN_MS) {
      showContactMessage("Please wait a few seconds before sending another message.", "error");
      setContactBtnLoading(false);
      return;
    }

    const name = contactForm.Name?.value?.trim() || "";
    const email = contactForm.Email?.value?.trim() || "";
    const message = contactForm.Message?.value?.trim() || "";

    if (name.length < 2 || name.length > 80) {
      showContactMessage("Please enter a valid name.", "error");
      setContactBtnLoading(false);
      return;
    }

    const emailField = contactForm.Email;

if (!emailField || !emailField.validity.valid || email.length > 120) {
  showContactMessage("Please enter a valid email address.", "error");
  setContactBtnLoading(false);
  return;
}

    if (message.length < 10 || message.length > 2000) {
      showContactMessage("Your message must be between 10 and 2000 characters.", "error");
      setContactBtnLoading(false);
      return;
    }

    showContactMessage("Transmitting your message…", "loading");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      lastContactSubmit = now;

      const response = await fetch(CONTACT_SCRIPT_URL, {
        method: "POST",
        body: new FormData(contactForm),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const raw = await response.text();
let data;

try {
  data = JSON.parse(raw);
} catch {
  throw new Error("Unexpected server response.");
}

if (data.result !== "success") {
  throw new Error(data.error || "Message was not saved.");
}
      showContactMessage("Message sent successfully! I’ll get back to you soon.", "success");
      contactForm.reset();

    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Contact form error:", err);

      const messageText =
        err.name === "AbortError"
          ? "The request timed out. Please try again."
          : (err.message || "Something went wrong. Please try again.");

      showContactMessage(messageText, "error");
    } finally {
      setContactBtnLoading(false);
    }
  });
}





// ================= REVIEWS SYSTEM =================
// Handles review submission + live feed + UI states

const REVIEWS_API_URL = "https://script.google.com/macros/s/AKfycbxUxwEpLsnYtiZapx1v8JFlkvos_N5WyIEG8tTb_rD4VTPDabduhB6FR9MFS9bTLrpo/exec";

const reviewForm = document.forms["submit-review-to-google-sheet"];
const reviewMsg = document.getElementById("reviewmsg");
const reviewFeed = document.querySelector(".reviews-feed");
const reviewFeedStatus = document.getElementById("reviews-feed-status");
const reviewFeedPanel = document.querySelector(".reviews-panel--feed");

// ================= PINNED REVIEWS =================
const PINNED_MATCHES = [
  {
    name: "Kyle Pillay",
    message: "Nikara, your portfolio is impressive! It showcases your skills in robotics and AI perfectly. Your projects are both creative and innovative."
  },
  {
    name: "Kiara Ishwarlall",
    message: "Amazing visuals! I really enjoyed going through your portfolio."
  }
];

// ================= UTILITIES =================

function sameReview(a, b) {
  const an = (a?.name || "").trim().toLowerCase();
  const am = (a?.message || "").trim().toLowerCase();
  const bn = (b?.name || "").trim().toLowerCase();
  const bm = (b?.message || "").trim().toLowerCase();
  return an === bn && am === bm;
}

function getInitials(name = "Anonymous") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "A";
}

function formatTimestamp(ts) {
  if (!ts) return "";

  const date = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

// ================= UI STATE =================
function setReviewMsg(text, type = "loading") {
  if (!reviewMsg) return;

  reviewMsg.className = `review-message show ${type}`;
  reviewMsg.textContent = text;

  if (type !== "loading") {
    setTimeout(() => {
      reviewMsg.classList.remove("show");
      reviewMsg.textContent = "";
    }, 4500);
  }
}

function setFeedStatus(text = "Feedback Stream") {
  if (!reviewFeedStatus) return;
  reviewFeedStatus.textContent = text;
}

function clearFeedPanelState() {
  if (!reviewFeedPanel) return;
  reviewFeedPanel.classList.remove("is-syncing", "is-updating");
}

function setFeedPanelState(state) {
  if (!reviewFeedPanel) return;

  clearFeedPanelState();

  if (state === "syncing") {
    reviewFeedPanel.classList.add("is-syncing");
  }

  if (state === "updating") {
    reviewFeedPanel.classList.add("is-updating");
  }
}

// ================= RENDER =================
function renderReviews(live = []) {
  if (!reviewFeed) return;

  const pinnedReviews = [];
  const normalReviews = [];

  live.forEach((review) => {
    const isPinned = PINNED_MATCHES.some((pinned) => sameReview(pinned, review));

    if (isPinned) {
      pinnedReviews.push(review);
    } else {
      normalReviews.push(review);
    }
  });

  // Build pinned reviews HTML
  const pinnedHTML = pinnedReviews.length
    ? pinnedReviews.map((r) => {
        const isPrivate = String(r.visibility || "Public").trim().toLowerCase() === "private";

        const displayName = isPrivate
          ? "Anonymous Reviewer"
          : (r.name || "Anonymous");

        const avatarName = isPrivate
          ? "Anonymous Reviewer"
          : (r.name || "Anonymous");

        const visibilityBadge = isPrivate
          ? `
            <span class="review-meta-pill review-meta-private">
              <i class="fa-solid fa-user-shield"></i>
              Private feedback shown anonymously
            </span>
          `
          : `
            <span class="review-meta-pill">
              <i class="fa-regular fa-message"></i>
              Public review
            </span>
          `;

        return `
          <article class="review-item review-item--system featured">
            <div class="review-shell">
              <div class="review-top">
                <div class="review-user">
                  <div class="review-avatar">
                    ${escapeHTML(getInitials(avatarName))}
                  </div>

                  <div class="review-identity">
                    <strong>${escapeHTML(displayName)}</strong>
                  </div>
                </div>

                <div class="review-side-meta">
                  <span class="review-badge review-badge--featured">
                    <i class="fa-solid fa-thumbtack"></i>
                    Pinned
                  </span>

                  <span class="review-time">
                    ${formatTimestamp(r.timestamp)}
                  </span>
                </div>
              </div>

              <div class="review-body">
                <p>${escapeHTML(r.message || "")}</p>
              </div>

              <div class="review-meta-row">
                <span class="review-meta-pill">
                  <i class="fa-regular fa-clock"></i>
                  ${formatTimestamp(r.timestamp)}
                </span>

                ${visibilityBadge}
              </div>
            </div>
          </article>
        `;
      }).join("")
    : "";

  // Build normal live reviews HTML
  const liveHTML = normalReviews.length
    ? normalReviews.slice(0, 30).map((r) => {
        const isPrivate = String(r.visibility || "Public").trim().toLowerCase() === "private";

        const displayName = isPrivate
          ? "Anonymous Reviewer"
          : (r.name || "Anonymous");

        const avatarName = isPrivate
          ? "Anonymous Reviewer"
          : (r.name || "Anonymous");

        const visibilityBadge = isPrivate
          ? `
            <span class="review-meta-pill review-meta-private">
              <i class="fa-solid fa-user-shield"></i>
              Private feedback shown anonymously
            </span>
          `
          : `
            <span class="review-meta-pill">
              <i class="fa-regular fa-message"></i>
              Public review
            </span>
          `;

        return `
          <article class="review-item review-item--live">
            <div class="review-shell">
              <div class="review-top">
                <div class="review-user">
                  <div class="review-avatar">
                    ${escapeHTML(getInitials(avatarName))}
                  </div>

                  <div class="review-identity">
                    <strong>${escapeHTML(displayName)}</strong>
                  </div>
                </div>

                <div class="review-side-meta">
                  <span class="review-badge review-badge--live">
                    <span class="review-badge-dot"></span>
                    Live
                  </span>

                  <span class="review-time">
                    ${formatTimestamp(r.timestamp)}
                  </span>
                </div>
              </div>

              <div class="review-body">
                <p>${escapeHTML(r.message || "")}</p>
              </div>

              <div class="review-meta-row">
                <span class="review-meta-pill">
                  <i class="fa-regular fa-clock"></i>
                  ${formatTimestamp(r.timestamp)}
                </span>

                ${visibilityBadge}
              </div>
            </div>
          </article>
        `;
      }).join("")
    : `
      <div class="reviews-empty reviews-empty--system">
        <i class="fa-regular fa-folder-open"></i>
        <span>No recent reviews in the live feed yet.</span>
      </div>
    `;

  reviewFeed.innerHTML = `
    <div class="reviews-block">
      ${pinnedHTML ? `
        <div class="reviews-featured-group">
          ${pinnedHTML}
        </div>
        <div class="reviews-divider"></div>
      ` : ""}

      <div class="reviews-section-label reviews-section-label--live">
        Review Stream
      </div>

      ${liveHTML}
    </div>
  `;

  document.querySelectorAll(".review-item").forEach((el) => {
    el.classList.add("review-item-visible");
  });
}

// ================= LOAD =================
async function loadReviews({ showStatus = false } = {}) {
  if (!reviewFeed) return;

  if (showStatus) {
    setFeedStatus("Syncing Feedback…");
    setFeedPanelState("syncing");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(REVIEWS_API_URL, {
  method: "GET",
  cache: "no-store",
  signal: controller.signal
});

    clearTimeout(timeoutId);

    const text = await res.text();
    const rawData = JSON.parse(text);

    if (!Array.isArray(rawData)) {
      throw new Error("doGet did not return an array");
    }

    const safeData = rawData
      .filter(item => item && typeof item === "object")
      .map(item => ({
        name: typeof item.name === "string" ? item.name.slice(0, 100) : "Anonymous",
        message: typeof item.message === "string" ? item.message.slice(0, 1500) : "",
        visibility: typeof item.visibility === "string" ? item.visibility : "Public",
        timestamp: item.timestamp || ""
      }));

    renderReviews(safeData);

  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Load reviews error:", err);
  } finally {
    if (!reviewFeedPanel?.classList.contains("is-updating")) {
      clearFeedPanelState();
      setFeedStatus("Feedback Stream");
    }
  }
}

// ================= SUBMIT =================
if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    setFeedStatus("Publishing Review…");
    setFeedPanelState("updating");

    const now = Date.now();

    // Honeypot check
    const hpField = reviewForm.querySelector('input[name="CompanySite"]');
    if (hpField && hpField.value.trim() !== "") {
      clearFeedPanelState();
      setFeedStatus("Feedback Stream");
      return;
    }

    // Minimum time-on-page check
    if (now - pageLoadTime < 3000) {
      setReviewMsg("Please wait a moment before submitting.", "error");
      clearFeedPanelState();
      setFeedStatus("Feedback Stream");
      return;
    }

    // Cooldown check
    if (now - lastReviewSubmit < REVIEW_COOLDOWN_MS) {
      setReviewMsg("Please wait a few seconds before submitting again.", "error");
      clearFeedPanelState();
      setFeedStatus("Feedback Stream");
      return;
    }

    const reviewName = reviewForm["Review-name"]?.value?.trim() || "";
const reviewMessage = reviewForm["Review-message"]?.value?.trim() || "";
const reviewVisibility = reviewForm["Review-visibility"]?.value || "";

if (!["Public", "Private"].includes(reviewVisibility)) {
  setReviewMsg("Please choose a valid visibility option.", "error");
  clearFeedPanelState();
  setFeedStatus("Feedback Stream");
  return;
}

    if (reviewName.length < 2 || reviewName.length > 100) {
      setReviewMsg("Please enter a valid name or company.", "error");
      clearFeedPanelState();
      setFeedStatus("Feedback Stream");
      return;
    }

    if (reviewMessage.length < 5 || reviewMessage.length > 1500) {
      setReviewMsg("Your review must be between 5 and 1500 characters.", "error");
      clearFeedPanelState();
      setFeedStatus("Feedback Stream");
      return;
    }

    setReviewMsg("Submitting your review…", "loading");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      lastReviewSubmit = now;

      const formData = new FormData(reviewForm);
formData.append("_clientKey", `${navigator.userAgent}|${window.location.hostname}`.slice(0, 120));


const res = await fetch(REVIEWS_API_URL, {
  method: "POST",
  body: formData,
  signal: controller.signal
});

clearTimeout(timeoutId);

if (!res.ok) {
  throw new Error(`Submit failed: ${res.status}`);
}

const data = await res.json();

if (!data.ok) {
  throw new Error(data.error || "Review could not be submitted.");
}

reviewForm.reset();
setReviewMsg("Review submitted — thank you!", "success");

await loadReviews({ showStatus: false });


      setTimeout(() => {
        clearFeedPanelState();
        setFeedStatus("Feedback Stream");
      }, 5000);

    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Submit review error:", err);

      const errorText =
  err.name === "AbortError"
    ? "The request timed out. Please try again."
    : (err.message || "Couldn’t submit right now. Please try again.");

      setReviewMsg(errorText, "error");
      clearFeedPanelState();
      setFeedStatus("Feedback Stream");
    }
  });
}

// ================= INIT =================
let reviewInterval = null;

function startReviewPolling() {
  if (reviewInterval || !reviewFeed) return;

  reviewInterval = setInterval(() => {
    const isTyping =
      document.activeElement === document.getElementById("review-name") ||
      document.activeElement === document.getElementById("review-message");

    const isUpdating = reviewFeedPanel?.classList.contains("is-updating");

    if (!document.hidden && !isTyping && !isUpdating) {
      loadReviews({ showStatus: true });
    }
  }, 60000);
}

function stopReviewPolling() {
  if (reviewInterval) {
    clearInterval(reviewInterval);
    reviewInterval = null;
  }
}

if (reviewFeed) {
  setFeedStatus("Feedback Stream");
  loadReviews({ showStatus: false });
  startReviewPolling();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopReviewPolling();
    } else {
      startReviewPolling();
    }
  });
}




// ================= NAVIGATION MENU =================
// Handles opening and closing of mobile side menu

const sideMenu = document.getElementById("sidemenu");
const menuOpenBtn = document.getElementById("menuOpenBtn");
const menuCloseBtn = document.getElementById("menuCloseBtn");

if (sideMenu) {
  const openMenu = () => {
    sideMenu.style.right = "0";
    document.body.classList.add("menu-open");
    if (menuOpenBtn) menuOpenBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    sideMenu.style.right = "-260px";
    document.body.classList.remove("menu-open");
    if (menuOpenBtn) menuOpenBtn.setAttribute("aria-expanded", "false");
  };

  if (menuOpenBtn) {
    menuOpenBtn.setAttribute("aria-expanded", "false");
    menuOpenBtn.addEventListener("click", openMenu);
  }

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });
}


