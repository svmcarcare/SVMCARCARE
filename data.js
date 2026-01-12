function fastDriveImage(link) {
  if (!link) return "";
  const match = link.match(/[-\w]{25,}/);
  return match
    ? `https://drive.google.com/uc?export=view&id=${match[0]}`
    : "";
}
// 🔴 PASTE YOUR GOOGLE SHEET CSV LINK HERE
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8H-DC4LQVHXCafnvXSEKAUJmATXxiMt1oBq970MPdNNieJggl8hm1kC8qfTSwXLWw5trZ3BCYTSDD/pub?output=csv";

let allCars = [];

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
        image: cols[5]   // front photo (Drive link later)
      };

      allCars.push(car);
    });

    renderCars(allCars);
  });

function renderCars(data) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  data.forEach(car => {
    container.innerHTML += `
      <div class="car-card">
       <img src="${fastDriveImage(car.image)}" loading="lazy">
        <h2>${car.name}</h2>
        <p>${car.price}</p>
        <p>${car.fuel} • ${car.year}</p>
      </div>
    `;
  });
}

// SEARCH
document.getElementById("search").addEventListener("keyup", e => {
  const value = e.target.value.toLowerCase();
  const filtered = allCars.filter(c =>
    c.name.toLowerCase().includes(value)
  );
  renderCars(filtered);
});

