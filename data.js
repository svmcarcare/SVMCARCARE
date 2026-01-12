const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8H-DC4LQVHXCafnvXSEKAUJmATXxiMt1oBq970MPdNNieJggl8hm1kC8qfTSwXLWw5trZ3BCYTSDD/pub?output=csv";

let allCars = [];

/* ---------- GOOGLE DRIVE HELPERS ---------- */

function getDriveId(link) {
  if (!link) return "";
  const match = link.match(/[-\w]{25,}/);
  return match ? match[0] : "";
}

// Google image CDN (works on mobile)
function driveImage(link) {
  const id = getDriveId(link);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : "";
}

// Drive video embed
function driveVideo(link) {
  const id = getDriveId(link);
  return id ? `https://drive.google.com/file/d/${id}/preview` : "";
}

/* ---------- CSV PARSER ---------- */

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let char of text) {
    if (char === '"') insideQuotes = !insideQuotes;
    else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if (char === "\n" && !insideQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else value += char;
  }

  if (value) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

/* ---------- FETCH & MAP DATA ---------- */

fetch(SHEET_CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);

    const headers = rows[0].map(h => h.trim());
    const index = name =>
      headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

    rows.slice(1).forEach(row => {
  if (!row.length) return;

  const name = (row[index("Car Name")] || "").trim();
  const rawImages = row[index("Car Front Photo")] || "";

  const imageLinks = rawImages
    .split(",")
    .map(l => l.trim())
    .filter(Boolean);

  // 🔥 SKIP EMPTY / DELETED ENTRIES
  if (!name && imageLinks.length === 0) return;

  allCars.push({
    name,
    price: row[index("Price")] || "",
    fuel: row[index("Fuel Type")] || "",
    year: row[index("Year")] || "",
    images: imageLinks,
    video: row[index("Full Car Video")] || ""
  });
});

    renderCars(allCars);
  });

/* ---------- RENDER CAR CARDS ---------- */

function renderCars(data) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  data.forEach((car, i) => {
    const thumbnail = car.images[0]
      ? driveImage(car.images[0])
      : "";

    container.innerHTML += `
      <div class="car-card" onclick="openModal(${i})">
        ${
          thumbnail
            ? `<img src="${thumbnail}"
                   loading="lazy"
                   style="width:100%;height:160px;object-fit:cover;">`
            : `<div style="height:160px;background:#ddd;"></div>`
        }
        <h2>${car.name}</h2>
        <p>₹${car.price}</p>
        <p>${car.fuel} • ${car.year}</p>
      </div>
    `;
  });
}

/* ---------- MODAL ---------- */

function openModal(i) {
  const car = allCars[i];

  document.getElementById("modalTitle").innerText = car.name;
  document.getElementById("modalInfo").innerText =
    `₹${car.price} • ${car.fuel} • ${car.year}`;

  const box = document.getElementById("modalImages");
  box.innerHTML = "";

  // 🔥 SHOW ALL IMAGES
  car.images.forEach(img => {
    box.innerHTML += `
      <img src="${driveImage(img)}"
           style="width:100%;max-height:320px;
                  object-fit:contain;
                  margin-bottom:10px;
                  border-radius:8px;">
    `;
  });

  if (car.video) {
    box.innerHTML += `
      <iframe
        src="${driveVideo(car.video)}"
        style="width:100%;height:300px;
               margin-top:12px;
               border:none;
               border-radius:8px;"
        allowfullscreen>
      </iframe>
    `;
  }

  document.getElementById("carModal").style.display = "block";
}

function closeModal() {
  document.getElementById("carModal").style.display = "none";
}

/* ---------- SEARCH ---------- */

document.getElementById("search").addEventListener("keyup", e => {
  const v = e.target.value.toLowerCase();
  renderCars(allCars.filter(c =>
    c.name.toLowerCase().includes(v)
  ));
});

