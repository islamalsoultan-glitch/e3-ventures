const toggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress span");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (toggle && mobileNav) {
  toggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

const syncHeaderState = () => {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
};

let scrollTicking = false;
const syncScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));

  if (progressBar) {
    progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  }

  syncHeaderState();
  scrollTicking = false;
};

const requestScrollSync = () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(syncScrollProgress);
  }
};

syncScrollProgress();
window.addEventListener("scroll", requestScrollSync, { passive: true });
window.addEventListener("resize", requestScrollSync);

const revealItems = document.querySelectorAll("[data-reveal]");
const counters = document.querySelectorAll("[data-count]");
const storySections = document.querySelectorAll(".story-section");
const storyDots = document.querySelectorAll("[data-step-dot]");

if (prefersReducedMotion.matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  document.body.classList.add("motion-ready");

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min((index % 6) * 0.055, 0.28)}s`;
  });

  requestAnimationFrame(() => {
    document.querySelectorAll(".home-hero [data-reveal]").forEach((item) => {
      item.classList.add("is-visible");
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.16,
    },
  );

  revealItems.forEach((item) => {
    if (!item.closest(".home-hero")) {
      revealObserver.observe(item);
    }
  });

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const counter = entry.target;
        const target = Number(counter.dataset.count);
        const prefix = counter.dataset.prefix ?? "";
        const suffix = counter.dataset.suffix ?? "";
        const duration = 1200;
        const start = performance.now();

        const renderValue = (timestamp) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          counter.textContent = `${prefix}${value}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(renderValue);
          }
        };

        requestAnimationFrame(renderValue);
        observer.unobserve(counter);
      });
    },
    { threshold: 0.55 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const setCurrentStory = (step) => {
  storySections.forEach((section) => {
    section.classList.toggle("is-current", section.dataset.storyStep === step);
  });

  storyDots.forEach((dot) => {
    dot.classList.toggle("is-current", dot.dataset.stepDot === step);
  });
};

if (storySections.length) {
  setCurrentStory("0");

  const storyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentStory(entry.target.dataset.storyStep);
        }
      });
    },
    {
      rootMargin: "-44% 0px -42% 0px",
      threshold: 0,
    },
  );

  storySections.forEach((section) => storyObserver.observe(section));
}

if (!prefersReducedMotion.matches) {
  document.querySelectorAll(".interactive-surface").forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const tiltX = (x - 0.5) * 5;
      const tiltY = (0.5 - y) * 4;

      surface.style.setProperty("--spot-x", `${x * 100}%`);
      surface.style.setProperty("--spot-y", `${y * 100}%`);
      surface.style.setProperty("--tilt-x", `${tiltX}deg`);
      surface.style.setProperty("--tilt-y", `${tiltY}deg`);

      if (surface.classList.contains("reason-card")) {
        surface.style.setProperty("--card-x", `${(x - 0.5) * 14}px`);
        surface.style.setProperty("--card-y", `${(y - 0.5) * 10}px`);
      }
    });

    surface.addEventListener("pointerleave", () => {
      surface.style.setProperty("--spot-x", "50%");
      surface.style.setProperty("--spot-y", "50%");
      surface.style.setProperty("--tilt-x", "0deg");
      surface.style.setProperty("--tilt-y", "0deg");
      surface.style.setProperty("--card-x", "0px");
      surface.style.setProperty("--card-y", "0px");
    });
  });
}
