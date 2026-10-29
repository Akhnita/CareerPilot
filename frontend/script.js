
const API_URL = "http://localhost:5000/applications";

const internships = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechNova",
    location: "Remote",
    type: "Work From Home",
    category: "Web Development",
    stipend: "₹8,000/month",
    icon: "💻"
  },
  {
    id: 2,
    title: "Java Developer Intern",
    company: "CodeCraft",
    location: "Delhi",
    type: "Hybrid",
    category: "Software Development",
    stipend: "₹10,000/month",
    icon: "☕"
  },
  {
    id: 3,
    title: "UI/UX Design Intern",
    company: "Pixel Studio",
    location: "Remote",
    type: "Work From Home",
    category: "Design",
    stipend: "₹7,000/month",
    icon: "🎨"
  },
  {
    id: 4,
    title: "Python Developer Intern",
    company: "DataSpark",
    location: "Gurugram",
    type: "On-site",
    category: "Software Development",
    stipend: "₹12,000/month",
    icon: "🐍"
  }
];

let appliedIds = [];

const jobGrid = document.getElementById("jobGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const applicationList = document.getElementById("applicationList");

// Get applications from backend
async function loadApplications() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load applications");
    }

    const applications = await response.json();

    appliedIds = applications.map((application) => application.id);

    renderInternships();
    renderApplications();
  } catch (error) {
    alert("Backend se connection nahi ho raha. Check karo ki server.js run ho raha hai.");
    console.error(error);
  }
}

// Display internship cards
function renderInternships() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  const filtered = internships.filter((job) => {
    const searchableText =
      `${job.title} ${job.company} ${job.location}`.toLowerCase();

    const matchesSearch = searchableText.includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  document.getElementById("resultCount").textContent =
    `${filtered.length} opportunities`;

  if (filtered.length === 0) {
    jobGrid.innerHTML = `
      <div class="empty">
        <h3>No internships found</h3>
        <p>Try another keyword or category.</p>
      </div>`;
    return;
  }

  jobGrid.innerHTML = filtered.map((job) => {
    const isApplied = appliedIds.includes(job.id);

    return `
      <article class="job-card">
        <div class="job-top">
          <div class="company-icon">${job.icon}</div>
          <span class="work-type">${job.type}</span>
        </div>

        <h3>${job.title}</h3>
        <p class="company-name">${job.company}</p>

        <div class="job-info">
          <span>📍 ${job.location}</span>
          <span>💰 ${job.stipend}</span>
        </div>

        <div class="job-bottom">
          <span class="category">${job.category}</span>
          <button
            class="apply-btn ${isApplied ? "applied" : ""}"
            data-id="${job.id}"
            ${isApplied ? "disabled" : ""}>
            ${isApplied ? "Applied ✓" : "Apply Now →"}
          </button>
        </div>
      </article>`;
  }).join("");
}

// Display applications received from backend
function renderApplications() {
  const selectedJobs = internships.filter((job) =>
    appliedIds.includes(job.id)
  );

  document.getElementById("navCount").textContent =
    selectedJobs.length;

  if (selectedJobs.length === 0) {
    applicationList.innerHTML = `
      <div class="application-row">
        <div class="app-info">
          <h4>No applications yet</h4>
          <p>Explore internships and click Apply Now.</p>
        </div>
      </div>`;
    return;
  }

  applicationList.innerHTML = selectedJobs.map((job) => `
    <div class="application-row">
      <span>${job.icon}</span>

      <div class="app-info">
        <h4>${job.title}</h4>
        <p>${job.company} · ${job.location}</p>
      </div>

      <span class="status">Applied</span>

      <button class="remove-btn" data-remove="${job.id}">
        Remove
      </button>
    </div>
  `).join("");
}

// Send application to backend
jobGrid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-id]");

  if (!button || button.disabled) return;

  const id = Number(button.dataset.id);
  const job = internships.find((item) => item.id === id);

  if (!job) return;

  button.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Application failed");
    }

    alert(result.message);
    await loadApplications();
  } catch (error) {
    alert(error.message || "Could not connect to the backend.");
    console.error(error);
    button.disabled = false;
  }
});

// Remove application through backend
applicationList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-remove]");

  if (!button) return;

  const id = Number(button.dataset.remove);
  button.disabled = true;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not remove application");
    }

    await loadApplications();
  } catch (error) {
    alert(error.message || "Could not connect to the backend.");
    console.error(error);
    button.disabled = false;
  }
});

// Search and category filter
searchInput.addEventListener("input", renderInternships);
categoryFilter.addEventListener("change", renderInternships);

document.getElementById("totalCount").textContent =
  internships.length;

// Load data when website opens
renderInternships();
loadApplications();
