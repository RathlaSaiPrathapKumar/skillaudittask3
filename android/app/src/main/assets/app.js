// ==========================================================================
// AeroSky Multi-API Sandbox Engine
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation and Tab Switching Logic
  initNavigation();

  // 2. Browser Network Status Listener
  initNetworkMonitor();

  // 3. Bind API Trigger Events
  initAPIBindings();
});

// ==========================================================================
// Tab & Sidebar Navigation Configuration
// ==========================================================================
function initNavigation() {
  const navButtons = document.querySelectorAll("#apiNav .step-nav-btn");
  const panels = document.querySelectorAll(".console-body .api-panel");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");

      // Set active nav button
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Set active panel
      panels.forEach((p) => {
        p.classList.remove("active");
        if (p.id === `panel-${target}`) {
          p.classList.add("active");
        }
      });
      
      // Auto scroll step nav on mobile to keep active item in view
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });
}

// ==========================================================================
// Browser Connection Monitoring
// ==========================================================================
function initNetworkMonitor() {
  const badge = document.getElementById("connectionBadge");
  const text = badge.querySelector(".badge-text");

  function updateStatus() {
    if (navigator.onLine) {
      badge.className = "connection-badge online";
      text.innerText = "Console Online";
    } else {
      badge.className = "connection-badge offline";
      text.innerText = "Console Offline";
    }
  }

  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  updateStatus(); // Initial call
}

// ==========================================================================
// API Execution Bindings
// ==========================================================================
function initAPIBindings() {
  // A. Weather Bindings
  const btnWeather = document.getElementById("btn-fetch-weather");
  const btnLocate = document.getElementById("weatherGeoLocateBtn");
  btnWeather.addEventListener("click", executeWeatherCall);
  btnLocate.addEventListener("click", getGeoCoordinates);

  // B. News Bindings
  const btnNews = document.getElementById("btn-fetch-news");
  btnNews.addEventListener("click", executeNewsCall);

  // C. Shows Bindings
  const btnShows = document.getElementById("btn-fetch-shows");
  btnShows.addEventListener("click", executeShowsCall);

  // D. Quotes Bindings
  const btnQuotes = document.getElementById("btn-fetch-quotes");
  btnQuotes.addEventListener("click", executeQuotesCall);

  // E. GitHub Bindings
  const btnGithub = document.getElementById("btn-fetch-github");
  btnGithub.addEventListener("click", executeGitHubCall);
}

// Helper to toggle isolated loading/success/error sub-states for a specific API
function setPanelState(panelName, stateName) {
  const container = document.getElementById(`results-${panelName}`);
  if (!container) return;

  const states = ["idle", "loading", "error", "success"];
  states.forEach((s) => {
    const el = container.querySelector(`.state-${s}`);
    if (el) el.style.display = s === stateName ? "block" : "none";
  });
}

// ==========================================================================
// 1. Weather API Module (Open-Meteo)
// ==========================================================================
async function executeWeatherCall() {
  const lat = document.getElementById("weatherLat").value.trim();
  const lon = document.getElementById("weatherLon").value.trim();
  
  if (!lat || !lon) return;

  setPanelState("weather", "loading");

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed");
    
    const data = await res.json();
    renderWeatherSuccess(data, lat, lon);
  } catch (err) {
    console.error(err);
    setPanelState("weather", "error");
  }
}

function getGeoCoordinates() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("weatherLat").value = pos.coords.latitude.toFixed(4);
        document.getElementById("weatherLon").value = pos.coords.longitude.toFixed(4);
        executeWeatherCall();
      },
      (err) => {
        alert("Failed to access device location. Please type coordinates manually.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function renderWeatherSuccess(data, lat, lon) {
  const container = document.getElementById("results-weather");
  const successDiv = container.querySelector(".state-success");
  
  const current = data.current;
  const weatherDetails = getWeatherDetails(current.weather_code, current.is_day);

  // Apply accent theme styles to weather widget
  successDiv.innerHTML = `
    <div class="glass-panel weather-result-card">
      <div class="weather-header-row">
        <div class="weather-loc-details">
          <h3>Target Location Weather</h3>
          <span>Coordinates: ${lat}, ${lon}</span>
        </div>
      </div>
      
      <div class="weather-main-data">
        <div class="weather-degree">
          ${Math.round(current.temperature_2m)}<span>°C</span>
        </div>
        <div class="weather-visuals">
          <div class="weather-icon-box">${weatherDetails.icon}</div>
          <span class="weather-state-desc">${weatherDetails.desc}</span>
        </div>
      </div>
      
      <div class="weather-metrics-grid" style="margin-top: 1.5rem;">
        <div class="metric-card">
          <span class="metric-label"><i data-lucide="thermometer"></i> Apparent Temp</span>
          <span class="metric-value">${Math.round(current.apparent_temperature)}°C</span>
        </div>
        <div class="metric-card">
          <span class="metric-label"><i data-lucide="wind"></i> Wind Speed</span>
          <span class="metric-value">${Math.round(current.wind_speed_10m)} km/h</span>
        </div>
        <div class="metric-card">
          <span class="metric-label"><i data-lucide="droplets"></i> Humidity</span>
          <span class="metric-value">${current.relative_humidity_2m}%</span>
        </div>
        <div class="metric-card">
          <span class="metric-label"><i data-lucide="compass"></i> Local Time</span>
          <span class="metric-value">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
  setPanelState("weather", "success");
}

// ==========================================================================
// 2. Space News API Module (Spaceflight News API)
// ==========================================================================
async function executeNewsCall() {
  const limit = document.getElementById("newsLimit").value;
  setPanelState("news", "loading");

  try {
    const url = `https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("News search failed");

    const data = await res.json();
    renderNewsSuccess(data.results);
  } catch (err) {
    console.error(err);
    setPanelState("news", "error");
  }
}

function renderNewsSuccess(articles) {
  const container = document.getElementById("results-news");
  const successDiv = container.querySelector(".state-success");

  if (!articles || articles.length === 0) {
    successDiv.innerHTML = `
      <div class="state-idle">
        <div class="idle-graphic"><i data-lucide="help-circle"></i></div>
        <h3>No Articles Found</h3>
        <p>No aerospace news directories returned in this batch.</p>
      </div>
    `;
    setPanelState("news", "success");
    return;
  }

  let html = `<div class="news-scroll-list">`;
  articles.forEach((art) => {
    const dateFormatted = new Date(art.published_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    html += `
      <div class="glass-panel news-article-card" onclick="window.open('${art.url}', '_blank')">
        <img class="news-img" src="${art.image_url || 'assets/icon.svg'}" alt="Article Image" onerror="this.src='assets/icon.svg'">
        <div class="news-body">
          <div class="news-source-row">
            <span class="news-site">${art.news_site || 'Space News'}</span>
            <span class="news-date">${dateFormatted}</span>
          </div>
          <h4 class="news-title">${art.title}</h4>
          <p class="news-summary">${art.summary || 'Click to read full coverage...'}</p>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  successDiv.innerHTML = html;
  setPanelState("news", "success");
}

// ==========================================================================
// 3. TV Shows Search API Module (TVmaze API)
// ==========================================================================
async function executeShowsCall() {
  const query = document.getElementById("showQuery").value.trim();
  if (query.length === 0) return;

  setPanelState("shows", "loading");

  try {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TV Show search failed");

    const data = await res.json();
    renderShowsSuccess(data);
  } catch (err) {
    console.error(err);
    setPanelState("shows", "error");
  }
}

function renderShowsSuccess(results) {
  const container = document.getElementById("results-shows");
  const successDiv = container.querySelector(".state-success");

  if (!results || results.length === 0) {
    successDiv.innerHTML = `
      <div class="state-idle">
        <div class="idle-graphic"><i data-lucide="help-circle"></i></div>
        <h3>No Matching Shows</h3>
        <p>We couldn't locate any records matching that search keyword. Please try another show name.</p>
      </div>
    `;
    setPanelState("shows", "success");
    return;
  }

  let html = `<div class="shows-grid">`;
  results.forEach((item) => {
    const show = item.show;
    const rating = show.rating && show.rating.average ? show.rating.average.toFixed(1) : "N/A";
    const image = show.image && show.image.medium ? show.image.medium : "assets/icon.svg";
    const genres = show.genres && show.genres.length > 0 ? show.genres.join(", ") : "Drama";

    html += `
      <div class="glass-panel show-card" onclick="window.open('${show.url || '#'}', '_blank')">
        <div class="show-poster-wrapper">
          <img class="show-poster" src="${image}" alt="${show.name} Poster" onerror="this.src='assets/icon.svg'">
          <div class="show-rating"><i data-lucide="star" style="width:12px; height:12px; fill:currentColor;"></i> ${rating}</div>
        </div>
        <div class="show-card-body">
          <h4 class="show-title">${show.name}</h4>
          <span class="show-genres">${genres}</span>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  successDiv.innerHTML = html;
  lucide.createIcons();
  setPanelState("shows", "success");
}

// ==========================================================================
// 4. Daily Quotes API Module (DummyJSON Quotes API)
// ==========================================================================
async function executeQuotesCall() {
  const limit = document.getElementById("quoteLimit").value;
  setPanelState("quotes", "loading");

  try {
    const url = `https://dummyjson.com/quotes?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Quotes retrieval failed");

    const data = await res.json();
    renderQuotesSuccess(data.quotes);
  } catch (err) {
    console.error(err);
    setPanelState("quotes", "error");
  }
}

function renderQuotesSuccess(quotes) {
  const container = document.getElementById("results-quotes");
  const successDiv = container.querySelector(".state-success");

  if (!quotes || quotes.length === 0) {
    successDiv.innerHTML = `
      <div class="state-idle">
        <div class="idle-graphic"><i data-lucide="help-circle"></i></div>
        <h3>No Quotes Found</h3>
        <p>No quotes were returned in the active response pack.</p>
      </div>
    `;
    setPanelState("quotes", "success");
    return;
  }

  let html = `<div class="quotes-list">`;
  quotes.forEach((q) => {
    html += `
      <div class="glass-panel quote-card">
        <span class="quote-glyph">&ldquo;</span>
        <blockquote class="quote-text">${q.quote}</blockquote>
        <span class="quote-author"><i data-lucide="user" class="inline-icon" style="width:12px;height:12px;"></i> ${q.author}</span>
      </div>
    `;
  });
  html += `</div>`;

  successDiv.innerHTML = html;
  lucide.createIcons();
  setPanelState("quotes", "success");
}

// ==========================================================================
// 5. GitHub Profiles API Module (GitHub User API)
// ==========================================================================
async function executeGitHubCall() {
  const username = document.getElementById("githubUser").value.trim();
  if (username.length === 0) return;

  setPanelState("github", "loading");

  try {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}`;
    const res = await fetch(url);
    
    if (res.status === 404) {
      showGitHubError("Profile Not Found", "No registered GitHub developer matches that handle. Please check your spelling.");
      return;
    }
    if (!res.ok) throw new Error("GitHub profile fetch failed");

    const data = await res.json();
    renderGitHubSuccess(data);
  } catch (err) {
    console.error(err);
    showGitHubError("Query Failure", "Failed to retrieve developer data. Make sure network access is online.");
  }
}

function showGitHubError(title, message) {
  const container = document.getElementById("results-github");
  const errorDiv = container.querySelector(".state-error");
  
  document.getElementById("gitErrorTitle").innerText = title;
  document.getElementById("gitErrorMsg").innerText = message;
  
  setPanelState("github", "error");
}

function renderGitHubSuccess(user) {
  const container = document.getElementById("results-github");
  const successDiv = container.querySelector(".state-success");

  successDiv.innerHTML = `
    <div class="glass-panel git-card">
      <div class="git-header">
        <img class="git-avatar" src="${user.avatar_url}" alt="${user.login} Avatar" onerror="this.src='assets/icon.svg'">
        <div class="git-names">
          <h3>${user.name || user.login}</h3>
          <a class="git-handle" href="${user.html_url}" target="_blank">@${user.login}</a>
        </div>
      </div>
      
      <p class="git-bio">${user.bio || "No developer biography provided for this account."}</p>
      
      <div class="git-stats">
        <div class="stat-box">
          <span class="stat-num">${user.public_repos}</span>
          <span class="stat-label">Repos</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">${user.followers}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">${user.following}</span>
          <span class="stat-label">Following</span>
        </div>
      </div>
      
      <div class="git-action-row">
        <button class="glass-btn primary-btn git-btn" onclick="window.open('${user.html_url}', '_blank')">
          <i data-lucide="external-link"></i> Visit Profile
        </button>
      </div>
    </div>
  `;

  lucide.createIcons();
  setPanelState("github", "success");
}

// ==========================================================================
// Weather Code SVG Mappings (Ported for Live Weather success display)
// ==========================================================================
function getWeatherDetails(code, isDay = 1) {
  const codes = {
    0: { desc: "Clear Sky", theme: "theme-sunny", icon: getSunnyIcon(isDay) },
    1: { desc: "Mainly Clear", theme: "theme-sunny", icon: getPartlyCloudyIcon(isDay) },
    2: { desc: "Partly Cloudy", theme: "theme-foggy", icon: getPartlyCloudyIcon(isDay) },
    3: { desc: "Overcast", theme: "theme-foggy", icon: getOvercastIcon() },
    45: { desc: "Foggy", theme: "theme-foggy", icon: getFogIcon() },
    48: { desc: "Depositing Rime Fog", theme: "theme-foggy", icon: getFogIcon() },
    51: { desc: "Light Drizzle", theme: "theme-rainy", icon: getRainyIcon(false) },
    53: { desc: "Moderate Drizzle", theme: "theme-rainy", icon: getRainyIcon(false) },
    55: { desc: "Dense Drizzle", theme: "theme-rainy", icon: getRainyIcon(true) },
    61: { desc: "Slight Rain", theme: "theme-rainy", icon: getRainyIcon(false) },
    63: { desc: "Moderate Rain", theme: "theme-rainy", icon: getRainyIcon(true) },
    65: { desc: "Heavy Rain", theme: "theme-rainy", icon: getRainyIcon(true) },
    71: { desc: "Slight Snow Fall", theme: "theme-snowy", icon: getSnowyIcon() },
    73: { desc: "Moderate Snow Fall", theme: "theme-snowy", icon: getSnowyIcon() },
    75: { desc: "Heavy Snow Fall", theme: "theme-snowy", icon: getSnowyIcon() },
    95: { desc: "Thunderstorm", theme: "theme-stormy", icon: getStormyIcon() }
  };
  return codes[code] || { desc: "Overcast Conditions", theme: "theme-foggy", icon: getOvercastIcon() };
}

function getSunnyIcon(isDay) {
  if (!isDay) return `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="16" fill="#e2e8f0"/><path d="M46 22a14 14 0 0 1-18 18 16 16 0 0 0 18-18z" fill="#94a3b8"/></svg>`;
  return `<svg viewBox="0 0 64 64" class="anim-spin-slow">
    <defs><linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs>
    <circle cx="32" cy="32" r="14" fill="url(#sunGrad)"/>
    <g stroke="url(#sunGrad)" stroke-width="3" stroke-linecap="round">
      <line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/>
      <line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/>
    </g>
  </svg>`;
}

function getPartlyCloudyIcon(isDay) {
  const sun = isDay ? `<circle cx="40" cy="24" r="10" fill="#f59e0b"/>` : `<circle cx="40" cy="24" r="10" fill="#cbd5e1"/>`;
  return `<svg viewBox="0 0 64 64">
    <g class="anim-float">${sun}
    <path d="M22 46 h20 c10 0 10-8 5-10 c0-8-12-8-13-3 c-5-5-14 0-12 8 c-4 0-7 2-7 5 c0 5 4 5 7 5 z" fill="#cbd5e1" opacity="0.9"/>
    </g>
  </svg>`;
}

function getOvercastIcon() {
  return `<svg viewBox="0 0 64 64" class="anim-float">
    <path d="M18 48 h22 c8 0 10-6 6-8 c0-8-10-8-12-3 c-4-5-12-1-10 6 c-3 0-6 1-6 5 c0 4 4 4 7 4 z" fill="#94a3b8"/>
  </svg>`;
}

function getRainyIcon(isHeavy) {
  const drops = isHeavy 
    ? `<path d="M24 50 v4 M32 52 v4 M40 50 v4" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" class="anim-rain"/>`
    : `<path d="M32 52 v4" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" class="anim-rain"/>`;
  return `<svg viewBox="0 0 64 64">
    <path d="M20 46 h24 c7 0 9-5 6-7 c0-7-9-7-11-3 c-4-4-11 0-9 7 c-3 0-6 1-6 4 c0 4 4 4 6 4 z" fill="#475569"/>
    ${drops}
  </svg>`;
}

function getSnowyIcon() {
  return `<svg viewBox="0 0 64 64">
    <path d="M20 46 h24 c7 0 9-5 6-7 c0-7-9-7-11-3 c-4-4-11 0-9 7 c-3 0-6 1-6 4 c0 4 4 4 6 4 z" fill="#94a3b8"/>
    <path d="M24 52 h.01 M32 54 h.01" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" class="anim-snow"/>
  </svg>`;
}

function getFogIcon() {
  return `<svg viewBox="0 0 64 64">
    <path d="M20 32 h24 c7 0 9-5 6-7 c0-7-9-7-11-3 c-4-4-11 0-9 7 c-3 0-6 1-6 4 c0 4 4 4 6 4 z" fill="#94a3b8" opacity="0.7"/>
    <path d="M14 40 h36 M18 46 h28" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
  </svg>`;
}

function getStormyIcon() {
  return `<svg viewBox="0 0 64 64">
    <path d="M20 44 h24 c7 0 9-5 6-7 c0-7-9-7-11-3 c-4-4-11 0-9 7 c-3 0-6 1-6 4 c0 4 4 4 6 4 z" fill="#1e1b4b"/>
    <path d="M30 42 l-6 10 h7 l-4 8 l11-12 h-7 z" fill="#fbbf24" class="anim-lightning"/>
  </svg>`;
}

// ==========================================================================
// PWA Service Worker Registration
// ==========================================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((reg) => console.log("AeroSky Service Worker registered scope:", reg.scope))
      .catch((err) => console.error("AeroSky Service Worker registration failed:", err));
  });
}
