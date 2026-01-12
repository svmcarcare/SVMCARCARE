const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8H-DC4LQVHXCafnvXSEKAUJmATXxiMt1oBq970MPdNNieJggl8hm1kC8qfTSwXLWw5trZ3BCYTSDD/pub?output=csv";

let allCars = [];

// Convert Google Drive link → direct link
function fastDriveLink(link) {
  if (!link) return "";
  const match = link.match(/[-\w]{25,}/);
  return match
    ? `https://drive.google.com/uc?export=view&id=${match[0]}`
    : "";
}

// Safe CSV parser (handles commas in links)
function parseCSV(text) {
  const rows = [];
  let current = [];
  let value = "";
  let insideQuotes = false;

  for (let char of text) {
    if (char === '"' ) {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      current.push(value);
      value = "";
    } else if (char === "\n" && !insideQuotes) {
      current.push(value);
      rows.push(current);
      current = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value) {
    current.push(value);
    rows.push(current);
  }
  return rows;
}

fetch(SHEET_CSV_URL)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const headers = rows[0];

    const index = name => headers.indexOf(name);

    rows.slice(1).forEach(row => {
      if (!row.length) return;

      const car = {
        name: row[index("Car Name")],
        price: row[index("Price")],
        fuel: row[index("Fuel Type")],
        year: row[index("Year")],
        image: row[index("Car Front Photo")],
        video: row[index("Full Car Video")]
      };

      allCars.push(car);
    });

    renderCars(allCars);
  });

// Render cards
function renderCars(data) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  data.forEach((car, i) => {
    container.innerHTML += `
      <div class="car-card" onclick="openModal(${i})">
        <img src="${fastDriveLink(car.image)}" loading="lazy">
        <h2>${car.name}</h2>
        <p>₹${car.price}</p>
        <p>${car.fuel} • ${car.year}</p>
      </div>
    `;
  });
}

// Modal
function openModal(i) {
  const car = allCars[i];

  document.getElementById("modalTitle").innerText = car.name;
  document.getElementById("modalInfo").innerText =
    `₹${car.price} • ${car.fuel} • ${car.year}`;

  const box = document.getElementById("modalImages");
  box.innerHTML = `
    <img src="${fastDriveLink(car.image)}"
         style="width:100%;border-radius:8px;">
  `;

  if (car.video) {
    box.innerHTML += `
      <video controls style="width:100%;margin-top:10px;border-radius:8px;">
        <source src="${fastDriveLink(car.video)}">
      </video>
    `;
  }

  document.getElementById("carModal").style.display = "block";
}

function closeModal() {
  document.getElementById("carModal").style.display = "none";
}

// Search
document.getElementById("search").addEventListener("keyup", e => {
  const v = e.target.value.toLowerCase();
  renderCars(allCars.filter(c => c.name.toLowerCase().includes(v)));
});
