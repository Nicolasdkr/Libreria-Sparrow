// === 1. Contraseña para entrar ===
const CLAVE_CORRECTA = "admin123";

function verificarClave() {
  const clave = document.getElementById("clave-admin").value;
  const mensaje = document.getElementById("mensaje-clave");

  if (clave === CLAVE_CORRECTA) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    renderLibros();
    mostrarCompras();
    cargarAPI();
  } else {
    mensaje.textContent = "⚠️ Clave incorrecta. Inténtalo de nuevo.";
  }
}

// === 2. CRUD de libros ===
let libros = JSON.parse(localStorage.getItem("libros")) || [];

function renderLibros() {
  const tbody = document.getElementById("tabla-libros");
  tbody.innerHTML = "";

  libros.forEach((libro, index) => {
    const fila = `
      <tr>
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>$${parseInt(libro.precio).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editarLibro(${index})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarLibro(${index})">🗑️</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

document.getElementById("form-libro").addEventListener("submit", function (e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const autor = document.getElementById("autor").value.trim();
  const precio = parseInt(document.getElementById("precio").value);

  if (!titulo || !autor || !precio) return;

  libros.push({ titulo, autor, precio });
  localStorage.setItem("libros", JSON.stringify(libros));
  renderLibros();
  this.reset();
});

function eliminarLibro(index) {
  libros.splice(index, 1);
  localStorage.setItem("libros", JSON.stringify(libros));
  renderLibros();
}

function editarLibro(index) {
  const libro = libros[index];
  document.getElementById("titulo").value = libro.titulo;
  document.getElementById("autor").value = libro.autor;
  document.getElementById("precio").value = libro.precio;
  eliminarLibro(index);
}

// === 3. Mostrar compras realizadas ===
function mostrarCompras() {
  const lista = document.getElementById("lista-compras");
  const compras = JSON.parse(localStorage.getItem("compras")) || [];

  if (compras.length === 0) {
    lista.innerHTML = "<p class='text-muted'>No hay compras registradas.</p>";
    return;
  }

  lista.innerHTML = "";

  compras.forEach((compra, i) => {
    const card = document.createElement("div");
    card.className = "card bg-secondary text-white mb-3 shadow";

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">📘 ${formatearLibro(compra.libro)} x${
      compra.cantidad
    }</h5>
        <p class="card-text mb-1"><strong>Cliente:</strong> ${compra.nombre}</p>
        <p class="card-text mb-1"><strong>RUT:</strong> ${compra.rut}</p>
        <p class="card-text mb-1"><strong>Email:</strong> ${compra.email}</p>
        <p class="card-text mb-1"><strong>Teléfono:</strong> ${
          compra.telefono
        }</p>
        <p class="card-text mb-1"><strong>Dirección:</strong> ${
          compra.direccion || "(sin datos)"
        }</p>
        <p class="card-text mb-1"><strong>Envío:</strong> ${compra.envio} - ${
      compra.fechaEntrega
    }</p>
        <p class="card-text mb-1"><strong>Método de pago:</strong> ${
          compra.pago
        }</p>
        <p class="card-text mb-1"><strong>País:</strong> ${compra.pais}</p>
        <p class="card-text"><strong>Fecha de compra:</strong> ${
          compra.fecha
        }</p>
      </div>
    `;
    lista.appendChild(card);
  });
}

function formatearLibro(valor) {
  const libros = {
    imperio_final: "El Imperio Final",
    cementerio_animales: "Cementerio de Animales",
    nombre_del_viento: "El Nombre del Viento",
    harry_potter: "Harry Potter",
    lotm: "Lord of the Mysteries",
    orgullo: "Orgullo y Prejuicio",
  };
  return libros[valor] || valor;
}

// === 4. API de indicadores ===
let indicadores = {};

async function cargarAPI() {
  try {
    const res = await fetch("https://mindicador.cl/api");
    const data = await res.json();

    indicadores = {
      uf: data.uf.valor,
      utm: data.utm.valor,
      euro: data.euro.valor,
    };

    document.getElementById(
      "valor-uf"
    ).textContent = `$${data.uf.valor.toLocaleString()}`;
    document.getElementById(
      "valor-utm"
    ).textContent = `$${data.utm.valor.toLocaleString()}`;
    document.getElementById(
      "valor-euro"
    ).textContent = `$${data.euro.valor.toLocaleString()}`;
  } catch (error) {
    console.error("Error cargando API:", error);
  }
}

// === 5. Conversión de monedas ===
document.getElementById("btn-convertir").addEventListener("click", () => {
  const monto = parseFloat(document.getElementById("convertir-monto").value);
  const tipo = document.getElementById("convertir-moneda").value;

  if (!monto || !indicadores[tipo]) return;

  const resultado = (monto / indicadores[tipo]).toFixed(2);
  document.getElementById(
    "resultado-conversion"
  ).textContent = `${resultado} ${tipo.toUpperCase()}`;
});
