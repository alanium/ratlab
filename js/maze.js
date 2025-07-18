let size = 21;
let comidas = [];
let maze = [], elements = [];
let ratas = [];

const mazeDiv = document.getElementById("maze");
const resultDiv = document.getElementById("result");


function cambiarTamanio(delta) {
  size += delta;
  if (size < 11) size = 11;
  document.getElementById("mazeSizeDisplay").textContent = size;
}

function createEmptyMaze() {
  maze = Array.from({ length: size }, () => Array(size).fill(0));
  elements = Array.from({ length: size }, () => Array(size));
}

function carveMaze(x, y) {
  const dirs = shuffle([[2, 0], [-2, 0], [0, 2], [0, -2]]);
  for (let [dx, dy] of dirs) {
    const nx = x + dx, ny = y + dy;
    if (ny > 0 && ny < size - 1 && nx > 0 && nx < size - 1 && maze[ny][nx] === 0) {
      maze[ny][nx] = 1;
      maze[y + dy / 2][x + dx / 2] = 1;
      carveMaze(nx, ny);
    }
  }
}

function generateMaze() {
  createEmptyMaze();
  const center = Math.floor(size / 2);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      maze[center + dy][center + dx] = 1;
    }
  }
  carveMaze(center, center);
}

function renderMaze() {
  mazeDiv.innerHTML = "";
  mazeDiv.style.gridTemplateColumns = `repeat(${size}, 20px)`;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (maze[y][x] === 1) cell.classList.add("path");
      mazeDiv.appendChild(cell);
      elements[y][x] = cell;
    }
  }
}

function placeFoodsAtExits() {
  const pathCells = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (maze[y][x] === 1) pathCells.push([x, y]);
    }
  }

  shuffle(pathCells);
  const leyenda = document.getElementById("leyenda");
  leyenda.innerHTML = "";

  const selected = pathCells.slice(0, comidas.length);

  selected.forEach(([x, y], index) => {
    const numero = index + 1;
    const comida = comidas[index];
    const cell = elements[y][x];

    cell.classList.add("food");
    cell.textContent = numero;
    cell.dataset.food = comida;

    const item = document.createElement("li");
    item.textContent = `${numero}. ${comida}`;
    leyenda.appendChild(item);
  });

  return selected;
}

function moveRat() {
  const startX = Math.floor(size / 2);
  const startY = Math.floor(size / 2);
  const rat = { x: startX, y: startY };
  const ratId = `rat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const cell = elements[rat.y][rat.x];
  cell.classList.add("mouse");
  cell.textContent = "🐭";
  cell.dataset.rat = ratId;

  const interval = setInterval(() => {
    const moves = shuffle([
      [0, -1], [0, 1], [-1, 0], [1, 0]
    ]).filter(([dx, dy]) => {
      const nx = rat.x + dx, ny = rat.y + dy;
      return maze[ny]?.[nx] === 1;
    });

    if (moves.length === 0) return;

    const [dx, dy] = moves[0];

    const currentCell = elements[rat.y][rat.x];
    if (currentCell.dataset.rat === ratId) {
      currentCell.classList.remove("mouse");
      currentCell.textContent = "";
      delete currentCell.dataset.rat;
    }

    rat.x += dx;
    rat.y += dy;

    const newCell = elements[rat.y][rat.x];
    newCell.classList.add("mouse");
    newCell.textContent = "🐭";
    newCell.dataset.rat = ratId;

    if (newCell.classList.contains("food")) {
      ratas.forEach(r => clearInterval(r.interval));
      ratas = [];

      const comida = newCell.dataset.food;
      const mensaje = `🐭 Ratita ${ratId} llegó a la opción ${newCell.textContent}: ${comida} 😋`;
      resultDiv.textContent += mensaje + "\n";
      resultDiv.classList.add("highlight");
      resultDiv.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        resultDiv.classList.remove("highlight");
      }, 10000);


      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, 100);

  ratas.push({ id: ratId, interval });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generarLaberinto() {
  ratas.forEach(r => clearInterval(r.interval));
  ratas = [];
  resultDiv.textContent = "";

  const input = document.getElementById("inputComidas").value;
  comidas = input.split(",").map(c => c.trim()).filter(c => c !== "");

  generateMaze();
  renderMaze();
  placeFoodsAtExits();
}

function soltarRata() {
  moveRat();
}

function reubicarComidas() {
  if (maze.length === 0 || elements.length === 0) return;

  ratas.forEach(r => clearInterval(r.interval));
  ratas = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = elements[y][x];
      if (cell.classList.contains("food")) {
        cell.classList.remove("food");
        cell.textContent = "";
        delete cell.dataset.food;
      }
      if (cell.classList.contains("mouse")) {
        cell.classList.remove("mouse");
        cell.textContent = "";
        delete cell.dataset.rat;
      }
    }
  }

  resultDiv.textContent = "";
  placeFoodsAtExits();
}
