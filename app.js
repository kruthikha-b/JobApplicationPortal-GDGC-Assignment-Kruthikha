let recruiterJobs = JSON.parse(localStorage.getItem("recruiterJobs") || "[]");
let applications = JSON.parse(localStorage.getItem("applications") || "[]");
let editingJobId = null;

document.getElementById("homeNav").onclick = (e) => { e.preventDefault(); setActiveNav("homeNav"); renderHome(); };
document.getElementById("jobsNav").onclick = (e) => { e.preventDefault(); setActiveNav("jobsNav"); renderJobList(); };
document.getElementById("seekerNav").onclick = (e) => { e.preventDefault(); setActiveNav("seekerNav"); renderJobSeeker(); };
document.getElementById("recruiterNav").onclick = (e) => { e.preventDefault(); setActiveNav("recruiterNav"); renderRecruiter(); };

setActiveNav("homeNav"); renderHome();

function setActiveNav(id) {
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function renderHome() {
  document.getElementById("mainContent").innerHTML = `
    <section class="home-hero" style="justify-content:center;text-align:center;">
      <div class="home-left" style="width:100%;margin:0 auto;">
        <h1 class="home-title" style="justify-content:center;">
          Welcome to <span class="highlight-gradient">Job Portal</span>
        </h1>
        <p class="home-subtitle">
          Connecting job seekers with great companies.<br>
          <span style="color: #1e8074; font-weight: 500;">Browse jobs, apply, or recruit the right talent — all in one place!</span>
        </p>
        <div class="home-btns" style="justify-content:center;">
          <button class="hero-btn" onclick="document.getElementById('jobsNav').click()">View Jobs</button>
          <button class="hero-btn" onclick="document.getElementById('seekerNav').click()">I'm a Job Seeker</button>
          <button class="hero-btn recruiter" onclick="document.getElementById('recruiterNav').click()">I'm a Recruiter</button>
        </div>
      </div>
    </section>
    <section class="home-features" style="justify-content:center;">
      <div class="feature">
        <span class="feature-icon">🔍</span>
        <h4>Powerful Search</h4>
        <p>Quickly filter jobs by title and explore detailed descriptions.</p>
      </div>
      <div class="feature">
        <span class="feature-icon">💼</span>
        <h4>For Recruiters</h4>
        <p>Post, edit, and manage job openings with ease.</p>
      </div>
      <div class="feature">
        <span class="feature-icon">🚀</span>
        <h4>One-Click Apply</h4>
        <p>Apply to jobs instantly with a modern, simple interface.</p>
      </div>
    </section>
    <footer class="home-footer">
      <span>© 2025 Job Portal</span>
    </footer>
  `;
}



// -------- JOBS TAB: ONLY SHOW JOBS USER APPLIED FOR ----------
function renderJobList() {
  document.getElementById("mainContent").innerHTML = `
    <section>
      <h2 style="margin-bottom:1.5rem;">Jobs I Applied For</h2>
      <div class="applied-cards-list" id="appliedCardsList"></div>
    </section>
  `;

  Promise.all([
    fetch('https://jsonfakery.com/jobs').then(resp => resp.json()),
    recruiterJobs
  ]).then(([apiJobs, recJobs]) => {
    const allJobs = [].concat(recJobs, apiJobs);

    let appliedJobs = applications.map(app => allJobs.find(j =>
      (j.id === app.jobId) || (j._id === app.jobId)
    )).filter(Boolean);

    const cardsDiv = document.getElementById('appliedCardsList');
    if (!appliedJobs.length) {
      cardsDiv.innerHTML = "<p style='padding:2rem 0;text-align:center;color:#999;'>You haven’t applied for any jobs yet.</p>";
      return;
    }

    appliedJobs.forEach((job, idx) => {
      let app = applications.find(a => a.jobId === job.id || a.jobId === job._id);
      cardsDiv.innerHTML += appliedJobCardHTML(job, app, idx + 1);
    });
  });
}

function appliedJobCardHTML(job, app, number) {
  const salary_from = job.salary_from || job.salary || "N/A";
  const salary_to = job.salary_to || job.salary || "N/A";
  const openings = job.number_of_opening || job.openings || "1";
  return `
    <div class="applied-job-card">
      <div class="applied-job-main">
        <div>
          <span class="applied-job-index">${number}.</span>
          <span class="applied-job-title">${escapeHTML(job.title || job.role)}</span>
        </div>
        <div class="applied-job-companyloc">
          <span class="applied-job-company">${escapeHTML(job.company)}</span> &bull; 
          <span class="applied-job-location">${escapeHTML(job.location)}</span>
        </div>
      </div>
      <div class="applied-job-extra">
        <span class="applied-job-salary">Salary: ₹${salary_from} – ₹${salary_to}</span>
        <span class="applied-job-openings">Openings: ${openings}</span>
        <span class="applied-job-appliedat">Applied: ${new Date(app.appliedAt).toLocaleDateString()}</span>
      </div>
    </div>
  `;
}

// ------- JOB SEEKER TAB: ALL JOBS + SEARCH BAR, NO APPLIED JOB LIST ---------
function renderJobSeeker() {
  document.getElementById("mainContent").innerHTML = `
    <section>
      <form id="jobSearchForm" class="search-jobs-bar">
        <input type="text" id="jobSearchInput" placeholder="Search by job title..." autocomplete="off"/>
        <button type="submit">Search</button>
        <button type="button" id="clearSearchBtn">Clear</button>
      </form>
      <div class="job-cards" id="allJobs"></div>
    </section>
  `;

  Promise.all([
    fetch('https://jsonfakery.com/jobs').then(resp => resp.json()),
    recruiterJobs
  ]).then(([apiJobs, recJobs]) => {
    const allJobs = [].concat(recJobs, apiJobs);

    function showCards(jobsToShow) {
      const cardsDiv = document.getElementById('allJobs');
      cardsDiv.innerHTML = "";
      jobsToShow.forEach(job => addJobCard(job, cardsDiv));
      if (jobsToShow.length === 0) cardsDiv.innerHTML = "<p>No jobs found matching your search.</p>";
    }

    showCards(allJobs);

    document.getElementById("jobSearchForm").onsubmit = function(e) {
      e.preventDefault();
      const search = document.getElementById('jobSearchInput').value.trim().toLowerCase();
      showCards(!search
        ? allJobs
        : allJobs.filter(job => (job.title || job.role || "").toLowerCase().includes(search))
      );
    };
    document.getElementById("clearSearchBtn").onclick = function () {
      document.getElementById("jobSearchInput").value = "";
      showCards(allJobs);
    }
  });
}

function addJobCard(job, parent) {
  const salary_from = job.salary_from || job.salary || "N/A",
    salary_to = job.salary_to || job.salary || "N/A",
    openings = job.number_of_opening || job.openings || "1";
  const isRecruiterJob = (job.id || "").toString().startsWith("recjob-");
  const card = document.createElement("div");
  card.className = "job-card";
  card.innerHTML = `
    <h3>${escapeHTML(job.title || job.role)}</h3>
    <div class="job-details">
      <small><b>Company:</b> ${escapeHTML(job.company)}</small><br/>
      <small><b>Location:</b> ${escapeHTML(job.location)}</small><br/>
      <small><b>Salary:</b> ₹${salary_from} – ₹${salary_to}</small><br/>
      <small><b>Openings:</b> ${openings}</small>
    </div>
    <div class="job-actions">
      <button onclick='viewJob(${JSON.stringify(job).replace(/'/g, "\\'")})'>View</button>
      <button class="applyBtn" onclick='applyJob(${JSON.stringify(job).replace(/'/g, "\\'")})'>Apply Now</button>
      ${
        isRecruiterJob && document.getElementById("recruiterNav").classList.contains("active")
          ? `<button class="editBtn" onclick='editRecruiterJob("${job.id}")'>Update</button>
             <button class="deleteBtn" onclick='deleteRecruiterJob("${job.id}")'>Delete</button>`
          : ""
      }
    </div>
  `;
  parent.appendChild(card);
}

function viewJob(job) {
  let qualString = parseQualifications(job.qualifications);
  const salary_from = job.salary_from || job.salary || "N/A";
  const salary_to = job.salary_to || job.salary || "N/A";
  const openings = job.number_of_opening || job.openings || "1";
  const detail = `
    <h2>${escapeHTML(job.title || job.role)}</h2>
    <p><b>Description:</b> ${escapeHTML(job.description || "")}</p>
    <p><b>Company:</b> ${escapeHTML(job.company)}</p>
    <p><b>Location:</b> ${escapeHTML(job.location)}</p>
    <p><b>Employment Type:</b> ${escapeHTML(job.employment_type)}</p>
    <p><b>Salary Range:</b> ₹${salary_from} – ₹${salary_to}</p>
    <p><b>Openings:</b> ${openings}</p>
    <p><b>Application Deadline:</b> ${escapeHTML(job.application_deadline || "")}</p>
    <p><b>Qualifications:</b></p>
    <ul>${qualString}</ul>
    <p><b>Contact:</b> ${escapeHTML(job.contact)}</p>
    <p><b>Job Category:</b> ${escapeHTML(job.job_category)}</p>
  `;
  document.getElementById("modalDetails").innerHTML = detail;
  showModal();
}

// --- APPLY MODAL ONLY FORM ---
function applyJob(job) {
  let alreadyApplied = applications.some(ap => ap.jobId === (job.id || job._id));
  const detail = `
    <form id="applyForm" class="apply-form-box">
      <h2>Apply for this Job</h2>
      <label for="applierName">Name:</label>
      <input id="applierName" name="name" required autocomplete="off"/>
      <label for="applierEmail">Email:</label>
      <input id="applierEmail" name="email" type="email" required autocomplete="off"/>
      <button type="submit" class="applyBtnBig"${alreadyApplied ? " disabled" : ""}>${alreadyApplied ? "Already Applied" : "Apply Now"}</button>
    </form>
    <div id="applyStatus"></div>
  `;
  document.getElementById("modalDetails").innerHTML = detail;
  document.getElementById("applyForm").onsubmit = function(e) {
    e.preventDefault();
    if (alreadyApplied) return;
    applications.push({
      jobId: job.id || job._id,
      name: this.name.value, email: this.email.value, appliedAt: new Date().toISOString()
    });
    localStorage.setItem("applications", JSON.stringify(applications));
    document.getElementById("applyStatus").innerHTML = `<span style="color:green">Application submitted!</span>`;
    this.querySelector("button").disabled = true;
    this.querySelector("button").textContent = "Already Applied";
  };
  showModal();
}

function parseQualifications(qual) {
  if (!qual) return "";
  if (typeof qual === "string") {
    try {
      const arr = JSON.parse(qual);
      if (Array.isArray(arr))
        return arr.map(q => `<li>${escapeHTML(q)}</li>`).join("");
      return `<li>${escapeHTML(qual)}</li>`;
    } catch {
      return `<li>${escapeHTML(qual)}</li>`;
    }
  }
  if (Array.isArray(qual))
    return qual.map(q => `<li>${escapeHTML(q)}</li>`).join("");
  return "";
}

// ---- RECRUITER (unchanged except for update/delete) ----
function renderRecruiter() {
let formHTML = `
  <h2 class="post-job-title">Post a Job</h2>
  <form id="recruiterForm" autocomplete="off" class="recruiter-form-card">
    <label>Role/Title
      <input name="role" required>
    </label>
    <label>Company
      <input name="company" required>
    </label>
    <label>Location
      <input name="location" required>
    </label>
    <label>Salary From
      <input name="salary_from" type="number" min="0">
    </label>
    <label>Salary To
      <input name="salary_to" type="number" min="0">
    </label>
    <label>Number of Openings
      <input name="number_of_opening" type="number" min="1" value="1">
    </label>
    <label>Employment Type
      <input name="employment_type">
    </label>
    <label>Application Deadline
      <input name="application_deadline" type="date">
    </label>
    <label>Contact
      <input name="contact">
    </label>
    <label>Job Category
      <input name="job_category">
    </label>
    <label>Description
      <textarea name="description" rows="3"></textarea>
    </label>
    <label>Qualifications (comma separated)
      <input name="qualifications">
    </label>
    <label>Upload Image
      <input name="image" type="file" accept="image/*">
    </label>
    <img id="imgPreview" class="upload-preview" style="display:none;"/>
    <button type="submit">${editingJobId ? "Update Job" : "Post Job"}</button>
  </form>
  <h2 class="post-job-title" style="font-size:1.6em;margin-top:40px;">Your Uploaded Jobs</h2>
  <div class="job-cards" id="recruiterJobs"></div>
`;


  document.getElementById("mainContent").innerHTML = formHTML;

  if (editingJobId) {
    const editJob = recruiterJobs.find(j => j.id === editingJobId);
    let f = document.getElementById("recruiterForm");
    if (f && editJob) {
      f.role.value = editJob.role;
      f.company.value = editJob.company;
      f.location.value = editJob.location;
      f.salary_from.value = editJob.salary_from;
      f.salary_to.value = editJob.salary_to;
      f.number_of_opening.value = editJob.number_of_opening;
      f.employment_type.value = editJob.employment_type;
      f.application_deadline.value = editJob.application_deadline;
      f.contact.value = editJob.contact;
      f.job_category.value = editJob.job_category;
      f.description.value = editJob.description;
      f.qualifications.value = Array.isArray(editJob.qualifications) ? editJob.qualifications.join(", ") : "";
      if (editJob.imageData) {
        document.getElementById("imgPreview").src = editJob.imageData;
        document.getElementById("imgPreview").style.display = "block";
      }
    }
  }

  document.getElementById("recruiterForm").onsubmit = function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    const job = {
      id: editingJobId || ("recjob-" + Date.now()),
      role: fd.get("role"),
      title: fd.get("role"),
      company: fd.get("company"),
      location: fd.get("location"),
      salary_from: fd.get("salary_from"),
      salary_to: fd.get("salary_to"),
      number_of_opening: fd.get("number_of_opening"),
      employment_type: fd.get("employment_type"),
      application_deadline: fd.get("application_deadline"),
      contact: fd.get("contact"),
      job_category: fd.get("job_category"),
      description: fd.get("description"),
      qualifications: fd.get("qualifications").split(',').map(str => str.trim())
    };
    const file = fd.get("image");
    if (file && file.name) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        job.imageData = evt.target.result;
        saveRecruiterJob(job);
        editingJobId = null;
        renderRecruiter();
      };
      reader.readAsDataURL(file);
    } else {
      if (editingJobId) {
        const old = recruiterJobs.find(j => j.id === editingJobId);
        if (old && old.imageData) { job.imageData = old.imageData; }
      }
      saveRecruiterJob(job);
      editingJobId = null;
      renderRecruiter();
    }
  };
  document.querySelector('#recruiterForm input[name="image"]').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const prev = document.getElementById('imgPreview');
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => { prev.src = evt.target.result; prev.style.display = "block"; };
      reader.readAsDataURL(file);
    } else { prev.style.display = "none"; }
  });
  const listContainer = document.getElementById("recruiterJobs");
  recruiterJobs.forEach(job => addJobCard(job, listContainer));
}

function saveRecruiterJob(job) {
  let idx = recruiterJobs.findIndex(j => j.id === job.id);
  if (idx !== -1)
    recruiterJobs[idx] = job;
  else
    recruiterJobs.unshift(job);
  localStorage.setItem("recruiterJobs", JSON.stringify(recruiterJobs));
}
function editRecruiterJob(id) {
  editingJobId = id;
  renderRecruiter();
}
function deleteRecruiterJob(id) {
  recruiterJobs = recruiterJobs.filter(j => j.id !== id);
  localStorage.setItem("recruiterJobs", JSON.stringify(recruiterJobs));
  renderRecruiter();
}

// ------- MODAL AND UTILS ---------

function showModal() {
  document.getElementById("modal").style.display = "block";
}
document.getElementById("closeModal").onclick = closeModal;
window.onclick = (e) => {
  if (e.target === document.getElementById("modal")) closeModal();
};
function closeModal() {
  document.getElementById("modal").style.display = "none";
}
function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, function (m) {
    return (
      {
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[m]
    );
  });
}
const darkToggle = document.getElementById("darkModeToggle");
darkToggle.onclick = function() {
  document.body.classList.toggle("dark-mode");
  darkToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "yes" : "no");
};
// Restore mode on page load:
if (localStorage.getItem("darkMode") === "yes") {
  document.body.classList.add("dark-mode");
  darkToggle.textContent = "☀️";
}
