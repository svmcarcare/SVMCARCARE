const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8H-DC4LQVHXCafnvXSEKAUJmATXxiMt1oBq970MPdNNieJggl8hm1kC8qfTSwXLWw5trZ3BCYTSDD/pub?output=csv";

let allCars = [];

function fastDriveImage(link) {
  if (!link) return "";
  const match = link.match(/[-\w]{25,}/);
  return match
    ? `https://drive.google.com/uc?export=view&id=${match[0]}`
    : "";
}

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const rows = text.split("\n").slice(1);

    rows.forEach(row => {
      if (!row) return;
      const cols = row.split(",");

      const car = {
        name: cols[1],
        price: cols[2],
        fuel: cols[3],
        year: cols[4],

        // MULTIPLE IMAGE FIELDS (comma separated links)
        images: [
          cols[5],
          cols[6],
          cols[7],
          cols[8]
        ].filter(Boolean)
      };

      allCars.push(car);
    });

    renderCars(allCars);
  });

function renderCars(data) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  data.forEach((car, index) => {
    container.innerHTML += `
      <div class="car-card" onclick="openModal(${index})">
        <img src="${fastDriveImage(car.images[0])}" loading="lazy">
        <h2>${car.name}</h2>
        <p>${car.price}</p>
        <p>${car.fuel} • ${car.year}</p>
      </div>
    `;
  });
}

/* ===== MODAL FUNCTIONS ===== */

function openModal(index) {
  const car = allCars[index];

  document.getElementById("modalTitle").innerText = car.name;
  document.getElementById("modalInfo").innerText =
    `${car.price} • ${car.fuel} • ${car.year}`;

  const imgBox = document.getElementById("modalImages");
  imgBox.innerHTML = "";

  car.images.forEach(img => {
    imgBox.innerHTML += `
      <img src="${fastDriveImage(img)}"
           style="width:100%;border-radius:8px;">
    `;
  });

  document.getElementById("carModal").style.display = "block";
}

function closeModal() {
  document.getElementById("carModal").style.display = "none";
}

/* SEARCH */
document.getElementById("search").addEventListener("keyup", e => {
  const value = e.target.value.toLowerCase();
  const filtered = allCars.filter(c =>
    c.name.toLowerCase().includes(value)
  );
  renderCars(filtered);
});

