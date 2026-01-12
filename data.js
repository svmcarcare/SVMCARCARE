const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8H-DC4LQVHXCafnvXSEKAUJmATXxiMt1oBq970MPdNNieJggl8hm1kC8qfTSwXLWw5trZ3BCYTSDD/pub?output=csv";

let allCars = [];

/* ---------- GOOGLE DRIVE HELPERS ---------- */

// Image: Drive → direct view
function fastDriveImage(link) {
  if (!link) return "";
  const match = link.match(/[-\w]{25,}/);
  return match
    ? `https://drive.google.com/uc?export=view&id=${match[0]}`
    : "";
}

// Video: Drive → embed preview
function driveVideoEmbed(link) {
  if (!link) return "";
  const match = link.match(/[-\w]{25,}/);
  return match
    ? `https://drive.google.com/file/d/${match[0]}/preview`
    : "";
}

/* ---------- SAFE CSV PARSER ---------- */

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let char of text) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if (char === "\n" && !insideQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
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

    // 🔥 Trim & normalize headers
    const headers = rows[0].map(h => h.trim());

    const index = name =>
      headers.findIndex(
        h => h.toLowerCase() === name.toLowerCase()
      );

    rows.slice(1).forEach(row => {
      if (!row.length) return;

      const car = {
        name: row[index("Car Name")] || "",
        price: row[index("Price")] || "",
        fuel: row[index("Fuel Type")] || "",
        year: row[index("Year")] || "",
        image: row[index("Car Front Photo")] || "",
        video: row[index("Full Car Video")] || ""
      };

      allCars.push(car);
    });

    renderCars(allCars);
  });

/* ---------- RENDER CAR CARDS ---------- */

function renderCars(data) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  data.forEach((car, i) => {
    container.innerHTML += `
      <div class="car-card" onclick="openModal(${i})">
        ${
          car.image
            ? `<img src="${fastDriveImage(car.image)}" loading="lazy">`
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

  if (car.image) {
    box.innerHTML += `
      <img src="${fastDriveImage(car.image)}"
           style="width:100%;border-radius:8px;">
    `;
  }

  if (car.video) {
    box.innerHTML += `
      <iframe
        src="${driveVideoEmbed(car.video)}"
        style="width:100%;height:300px;margin-top:12px;border-radius:8px;"
        allow="autoplay"
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
  renderCars(
    allCars.filter(c => c.name.toLowerCase().includes(v))
  );
});

