// NewsData configuration
// NOTE: You previously had a client-side API key; re-enabling it so the site works
// on GitHub Pages. If you prefer a proxy later, set USE_PROXY = true and provide a server endpoint.
const API_KEY = "pub_0a40bca6a31a4b92ae3f8eab6996da01"; // original key restored per request
const USE_PROXY = false; // set to true if you later add a server-side proxy at /api/news

// Default landing page query
let currentQuery = "Tesla";

// Map friendly category names to optimized NewsData search queries
const categoryQueries = {
  "Tesla Model 3": "Tesla Model 3",
  "Tesla Model Y": "Tesla Model Y",
  "Tesla Model S": "Tesla Model S",
  "Tesla Model X": "Tesla Model X",
  "Cybertruck": "Tesla Cybertruck",
  "Tesla Autopilot": "Tesla Autopilot",
  "Tesla FSD": "Tesla Full Self Driving",
  "Rivian": "Rivian Electric Truck",
  "Lucid Motors": "Lucid Air EV",
  "BYD EV": "BYD Electric Vehicle",
  "Volkswagen EV": "Volkswagen ID.4 OR VW EV",
  "Ford EV": "Ford Mustang Mach-E OR F-150 Lightning",
  "Tesla Supercharger": "Tesla Supercharger Network",
  "EV Charging Stations": "EV Charging Stations",
  "Battery Technology": "EV Battery Technology",
  "Solid State Batteries": "Solid State Battery",
  "EV incentives": "EV Tax Credit OR Electric Vehicle Incentives",
  "EV Market": "Global EV Market",
  "Sustainability": "Sustainable Transportation EV",
  "EV Infrastructure": "EV Infrastructure OR Charging Grid",
};

// Update category → fetch replacement query
function updateCategory(query) {
  currentQuery = categoryQueries[query] || query;
  fetchNews();
}

// Fetch news from NewsData.io
async function fetchNews() {
  const newsContainer = document.getElementById("news-container");
  newsContainer.setAttribute('aria-busy', 'true');
  newsContainer.innerHTML = "<p>Loading latest EV news...</p>";

  let endpoint = null;
  if (API_KEY && !USE_PROXY) {
    endpoint = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(currentQuery)}&language=en&country=us&image=1`;
  } else if (USE_PROXY) {
    // Expect a server-side proxy at /api/news that accepts the same query params
    endpoint = `/api/news?q=${encodeURIComponent(currentQuery)}&language=en&country=us&image=1`;
  } else {
    newsContainer.innerHTML = "<p class='notice'>No API configured. Please configure a server-side proxy or set an API key (not recommended).</p>";
    newsContainer.setAttribute('aria-busy', 'false');
    return;
  }

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("NewsData.io result:", data);

    newsContainer.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      newsContainer.innerHTML = "<p>No articles found for this category.</p>";
      return;
    }

    data.results.forEach((article) => {
      const card = document.createElement("div");
      card.className = "news-card";

      // Fallback image if missing
      const imgSrc =
        article.image_url ||
        "https://via.placeholder.com/300x180.png?text=EV+News";

      // Clickable image
      const imgLink = document.createElement("a");
      imgLink.href = article.link || "#";
      imgLink.target = "_blank";

      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = article.title || "Article image";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 600;

      imgLink.appendChild(img);
      card.appendChild(imgLink);

      // Title
      const title = document.createElement("h2");
      title.textContent = article.title || "Untitled Article";
      card.appendChild(title);

      // Description text
      const desc = document.createElement("p");
      desc.textContent =
        article.description || "No description available for this article.";
      card.appendChild(desc);

      // Read More link
      const readMore = document.createElement("a");
      readMore.href = article.link || "#";
      readMore.target = "_blank";
      readMore.className = "read-more";
      readMore.textContent = "Read More";
      card.appendChild(readMore);

      // Share Button
      const shareBtn = document.createElement("button");
      shareBtn.textContent = "Share";
      shareBtn.setAttribute('aria-label', `Share article: ${article.title}`);
      shareBtn.onclick = () => shareArticle(article.title, article.link || "#");
      card.appendChild(shareBtn);

      newsContainer.appendChild(card);
    });
    newsContainer.setAttribute('aria-busy', 'false');
  } catch (err) {
    console.error("Error fetching NewsData articles:", err);
    newsContainer.innerHTML = "<p>Error loading news. Please try again later.</p>";
    newsContainer.setAttribute('aria-busy', 'false');
  }
}

// Native share API
function shareArticle(title, url) {
  if (navigator.share) {
    navigator
      .share({
        title,
        url,
      })
      .catch((err) => console.error("Share failed:", err));
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(`${title} - ${url}`).then(() => {
      alert("Link copied to clipboard.");
    });
  } else {
    // Fallback: select and copy via prompt
    window.prompt("Copy this link:", url);
  }
}

// UI Toggles
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function toggleSidenav() {
  document.getElementById("sidenav").classList.toggle("open");
}

// Load on startup
window.onload = fetchNews;
