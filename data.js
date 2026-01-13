const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8H-DC4LQVHXCafnvXSEKAUJmATXxiMt1oBq970MPdNNieJggl8hm1kC8qfTSwXLWw5trZ3BCYTSDD/pub?output=csv";

let allCars = [];

/* ---------- DRIVE HELPERS ---------- */

function getDriveId(link) {
  if (!link) return "";
  const match = link.match(/[-\w]{25,}/);
  return match ? match[0] : "";
}

function driveImage(link) {
  const id = getDriveId(link);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : "";
}

function driveVideo(link) {
  const id = getDriveId(link);
  return id ? `https://drive.google.com/file/d/${id}/preview` : "";
}

/* ---------- SAFE CSV PARSER ---------- */

function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(row =>
      row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
        ?.map(cell => cell.replace(/^"|"$/g, "").trim()) || []
    );
}

/* ---------- FETCH DATA ---------- */

fetch(SHEET_CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const headers = rows[0];

    const index = name =>
      headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

    rows.slice(1).forEach(row => {
      const name = row[index("Car Name")] || "";
      if (!name) return;

      const imagesRaw = row[index("Car Front Photo")] || "";

      const images = imagesRaw
        .split(",")
        .map(l => l.trim())
        .filter(Boolean);

      allCars.push({
        name,
        price: row[index("Price")] || "",
        fuel: row[index("Fuel Type")] || "",
        year: row[index("Year")] || "",
        images,
        video: row[index("Full Car Video")] || ""
      });
    });

    renderCars(allCars);
  });

/* ---------- RENDER ---------- */

function renderCars(data) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  data.forEach((car, i) => {
    const thumb = car.images[0] ? driveImage(car.images[0]) : "";

    container.innerHTML += `
      <div class="car-card" onclick="openModal(${i})">
        ${
          thumb
            ? `<img src="${thumb}" loading="lazy"
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
      <iframe src="${driveVideo(car.video)}"
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
