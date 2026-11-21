/* OMNIA INTERACTIONS
   Handles rendering content, mobile navigation, filters and search. */
(() => {
  const content = window.OMNIA_CONTENT;
  if (!content) return;

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && value !== undefined) element.textContent = value;
  };
  const setHTML = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && value !== undefined) element.innerHTML = value;
  };

  // Hero
  setText("#heroEyebrow", content.hero.eyebrow);
  setText("#heroLine1", content.hero.headlineLine1);
  setText("#heroLine2", content.hero.headlineLine2);
  setText("#heroDescription", content.hero.description);
  setText("#heroPrimary", content.hero.primaryAction);
  setText("#heroSecondary", content.hero.secondaryAction);

  // Featured perspective
  setText("#featuredKicker", content.featured.kicker);
  setText("#featuredHeading", content.featured.heading);
  setText("#featuredTopic", content.featured.topic);
  setText("#featuredTitle", content.featured.title);
  setText("#featuredDescription", content.featured.description);
  setText("#featuredCaption", content.featured.caption);

  // Journal heading and cards
  setText("#journalKicker", content.journal.kicker);
  setText("#journalHeading", content.journal.heading);
  setText("#journalDescription", content.journal.description);
  const grid = document.getElementById("ideaGrid");
  content.journal.cards.forEach(card => {
    const article = document.createElement("article");
    article.className = "idea-card";
    article.dataset.category = card.category;
    article.dataset.search = card.keywords || "";
    article.innerHTML = `
      <div class="card-meta"><span class="topic"></span><span class="card-number"></span></div>
      <h3></h3><p></p><div class="card-foot"></div>`;
    article.querySelector(".topic").textContent = card.label;
    article.querySelector(".card-number").textContent = card.number;
    article.querySelector("h3").textContent = card.title;
    article.querySelector("p").textContent = card.description;
    article.querySelector(".card-foot").textContent = card.footer;
    grid.appendChild(article);
  });

  // Short thoughts
  setText("#thoughtsKicker", content.thoughts.kicker);
  setHTML("#thoughtsHeading", content.thoughts.heading);
  setText("#thoughtsDescription", content.thoughts.description);
  const thoughtList = document.getElementById("thoughtList");
  content.thoughts.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "thought";
    const thought = document.createElement("p");
    const label = document.createElement("span");
    thought.textContent = item.text;
    label.textContent = item.label;
    row.append(thought, label);
    thoughtList.appendChild(row);
  });

  // About and footer
  setText("#aboutKicker", content.about.kicker);
  setText("#aboutHeading", content.about.heading);
  const aboutCopy = document.getElementById("aboutCopy");
  content.about.paragraphs.forEach(paragraph => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    aboutCopy.appendChild(p);
  });
  setText("#footerTagline", content.footer.tagline);

  // Mobile navigation
  const menuButton = document.getElementById("menuToggle");
  const navigation = document.getElementById("siteNav");
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "Close" : "Menu";
  });
  navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "Menu";
  }));

  // Subject filters and text search
  const filterButtons = Array.from(document.querySelectorAll(".filter"));
  const search = document.getElementById("ideaSearch");
  const emptyState = document.getElementById("emptyState");
  const status = document.getElementById("resultsStatus");
  let selectedCategory = "all";

  function updateIdeas() {
    const term = search.value.trim().toLocaleLowerCase();
    let visibleCount = 0;
    grid.querySelectorAll(".idea-card").forEach(card => {
      const categoryMatches = selectedCategory === "all" || card.dataset.category === selectedCategory;
      const textMatches = !term || (card.textContent + " " + card.dataset.search).toLocaleLowerCase().includes(term);
      const visible = categoryMatches && textMatches;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    emptyState.style.display = visibleCount ? "none" : "block";
    status.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "idea" : "ideas"}`;
  }
  filterButtons.forEach(button => button.addEventListener("click", () => {
    selectedCategory = button.dataset.filter;
    filterButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    updateIdeas();
  }));
  search.addEventListener("input", updateIdeas);
  document.getElementById("year").textContent = new Date().getFullYear();
  updateIdeas();
})();
