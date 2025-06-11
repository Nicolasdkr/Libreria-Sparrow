// admin.js actualizado para el Panel de Administración

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("btn-convertir")
    .addEventListener("click", convertirMoneda);
  document
    .getElementById("form-libro")
    .addEventListener("submit", agregarLibro);
  cargarAPI();
  cargarCompras();
  cargarLibros();
});

function verificarClave() {
  const clave = document.getElementById("clave-admin").value;
  const mensaje = document.getElementById("mensaje-clave");

  if (clave.trim() === "admin123") {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
  } else {
    mensaje.textContent = "⚠️ Clave incorrecta";
  }
}

function cargarCompras() {
  const lista = document.getElementById("lista-compras");
  lista.innerHTML = "";

  const compras = JSON.parse(localStorage.getItem("compras")) || [];

  if (compras.length === 0) {
    lista.innerHTML = "<p class='text-muted'>No hay pedidos registrados.</p>";
    return;
  }

  compras.forEach((compra, index) => {
    const totalCalculado =
      (compra.precioUnitario || 0) * (compra.cantidad || 1) +
      (compra.costoEnvio || 0);

    const card = document.createElement("div");
    card.className = "card text-dark bg-light mb-4 shadow-sm";

    const cardBody = `
      <div class="card-body">
        <h5 class="card-title">📦 Pedido de ${compra.nombre}</h5>
        <p><strong>Nombre encriptado:</strong> <code>${
          compra.nombreEncriptado || "-"
        }</code></p>
        <p><strong>RUT:</strong> ${compra.rut}</p>
        <p><strong>Email:</strong> ${compra.email}</p>
        <p><strong>Teléfono:</strong> ${compra.telefono}</p>
        <p><strong>Dirección:</strong>
          <input type="text" class="form-control mb-2" value="${
            compra.direccion
          }" id="direccion-${index}">
        </p>
        <p><strong>Libro:</strong> ${compra.libro}</p>
        <p><strong>Cantidad:</strong> ${compra.cantidad}</p>
        <p><strong>Precio Unitario:</strong> $${(
          compra.precioUnitario || 0
        ).toLocaleString()}</p>
        <p><strong>Método de pago:</strong>
          <input type="text" class="form-control mb-2" value="${
            compra.pago
          }" id="pago-${index}">
        </p>
        <p><strong>Tipo de envío:</strong> ${compra.envio}</p>
        <p><strong>Costo de envío:</strong> $${(
          compra.costoEnvio || 0
        ).toLocaleString()}</p>
        <p><strong>País:</strong> ${compra.pais}</p>
        <p><strong>Fecha de compra:</strong> ${compra.fecha}</p>
        <p><strong>Fecha estimada de entrega:</strong> ${
          compra.fechaEntrega
        }</p>
        <p class="fw-bold text-success">💰 Total a pagar: $${totalCalculado.toLocaleString()} CLP</p>

        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-success btn-sm" onclick="guardarEdicion(${index})">Guardar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarCompra(${index})">Eliminar</button>
        </div>
      </div>
    `;

    card.innerHTML = cardBody;
    lista.appendChild(card);
  });
}

function guardarEdicion(index) {
  const compras = JSON.parse(localStorage.getItem("compras")) || [];

  compras[index].direccion = document.getElementById(
    `direccion-${index}`
  ).value;
  compras[index].pago = document.getElementById(`pago-${index}`).value;

  localStorage.setItem("compras", JSON.stringify(compras));
  alert("✅ Pedido actualizado correctamente.");
  cargarCompras();
}

function eliminarCompra(index) {
  const compras = JSON.parse(localStorage.getItem("compras")) || [];
  if (confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
    compras.splice(index, 1);
    localStorage.setItem("compras", JSON.stringify(compras));
    cargarCompras();
  }
}

// API moneda
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
    ).textContent = `$${indicadores.uf.toLocaleString()}`;
    document.getElementById(
      "valor-utm"
    ).textContent = `$${indicadores.utm.toLocaleString()}`;
    document.getElementById(
      "valor-euro"
    ).textContent = `$${indicadores.euro.toLocaleString()}`;
  } catch (error) {
    console.error("Error cargando API:", error);
  }
}

function convertirMoneda() {
  const monto = parseFloat(document.getElementById("convertir-monto").value);
  const tipo = document.getElementById("convertir-moneda").value;
  if (!monto || !indicadores[tipo]) return;
  const resultado = (monto / indicadores[tipo]).toFixed(2);
  document.getElementById(
    "resultado-conversion"
  ).textContent = `${resultado} ${tipo.toUpperCase()}`;
}

// Gestión de libros
function agregarLibro(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const autor = document.getElementById("autor").value.trim();
  const precio = parseInt(document.getElementById("precio").value);

  if (!titulo || !autor || !precio) return;

  const nuevoLibro = { titulo, autor, precio };
  const libros = JSON.parse(localStorage.getItem("libros")) || [];
  libros.push(nuevoLibro);
  localStorage.setItem("libros", JSON.stringify(libros));

  document.getElementById("form-libro").reset();
  cargarLibros();
}

function cargarLibros() {
  const tabla = document.getElementById("tabla-libros");
  tabla.innerHTML = "";

  const libros = JSON.parse(localStorage.getItem("libros")) || [];

  libros.forEach((libro, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>$${libro.precio.toLocaleString()}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminarLibro(${index})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function eliminarLibro(index) {
  const libros = JSON.parse(localStorage.getItem("libros")) || [];
  if (confirm("¿Seguro que deseas eliminar este libro?")) {
    libros.splice(index, 1);
    localStorage.setItem("libros", JSON.stringify(libros));
    cargarLibros();
  }
}
