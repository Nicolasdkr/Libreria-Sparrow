document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("btn-convertir")
    .addEventListener("click", convertirMoneda);
  document
    .getElementById("form-libro")
    .addEventListener("submit", agregarLibro);
  cargarAPI();
  cargarLibros();
  cargarPedidos();
  cargarClientes();
  calcularTop10();
});

let indiceEdicion = null;

// 🔐 Clave de acceso
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

// 💱 API moneda
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

// 📚 Gestión de libros
function agregarLibro(e) {
  e.preventDefault();

  const libro = {
    titulo: document.getElementById("titulo").value.trim(),
    autor: document.getElementById("autor").value.trim(),
    categoria: document.getElementById("categoria").value.trim(),
    precio: parseInt(document.getElementById("precio").value),
    stock: parseInt(document.getElementById("stock").value),
    estado: document.getElementById("estado").value,
    proveedor_id: document.getElementById("proveedor").value.trim(),
  };

  if (!libro.titulo || !libro.autor || isNaN(libro.precio)) return;

  const libros = JSON.parse(localStorage.getItem("libros")) || [];

  if (indiceEdicion !== null) {
    libros[indiceEdicion] = libro;
    indiceEdicion = null;
    document.querySelector("#form-libro button[type='submit']").textContent =
      "Agregar Libro";
  } else {
    libros.push(libro);
  }

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
      <td>${libro.categoria}</td>
      <td>$${libro.precio.toLocaleString()}</td>
      <td>${libro.stock}</td>
      <td>${libro.estado}</td>
      <td>${libro.proveedor_id || "-"}</td>
      <td class="d-flex gap-2 justify-content-center">
        <button class="btn btn-sm btn-warning" onclick="editarLibro(${index})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarLibro(${index})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function editarLibro(index) {
  const libros = JSON.parse(localStorage.getItem("libros")) || [];
  const libro = libros[index];

  document.getElementById("titulo").value = libro.titulo;
  document.getElementById("autor").value = libro.autor;
  document.getElementById("categoria").value = libro.categoria;
  document.getElementById("precio").value = libro.precio;
  document.getElementById("stock").value = libro.stock;
  document.getElementById("estado").value = libro.estado;
  document.getElementById("proveedor").value = libro.proveedor_id;

  indiceEdicion = index;
  document.querySelector("#form-libro button[type='submit']").textContent =
    "Guardar Cambios";
}

function eliminarLibro(index) {
  const libros = JSON.parse(localStorage.getItem("libros")) || [];
  if (confirm("¿Seguro que deseas eliminar este libro?")) {
    libros.splice(index, 1);
    localStorage.setItem("libros", JSON.stringify(libros));
    cargarLibros();
  }
}

// 📦 Gestión de pedidos
function cargarPedidos() {
  const tabla = document.getElementById("tabla-pedidos");
  tabla.innerHTML = "";

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  let enviados = 0;
  let pendientes = 0;

  pedidos.forEach((pedido, index) => {
    if (pedido.estado_envio === "Enviado") enviados++;
    else pendientes++;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${pedido.nombre}</td>
      <td>${pedido.productos[0]?.titulo || "-"}</td>
      <td>${pedido.productos[0]?.cantidad || 1}</td>
      <td>$${pedido.total_final.toLocaleString()}</td>
      <td>
        <select onchange="actualizarEstadoPedido(${index}, this.value)" class="form-select form-select-sm">
          <option ${
            pedido.estado_envio === "Pendiente" ? "selected" : ""
          }>Pendiente</option>
          <option ${
            pedido.estado_envio === "Enviado" ? "selected" : ""
          }>Enviado</option>
          <option ${
            pedido.estado_envio === "Recibido" ? "selected" : ""
          }>Recibido</option>
        </select>
      </td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminarPedido(${index})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });

  document.getElementById("contador-enviados").textContent = enviados;
  document.getElementById("contador-pendientes").textContent = pendientes;
}

function actualizarEstadoPedido(index, nuevoEstado) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos[index].estado_envio = nuevoEstado;
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  cargarPedidos();
}

function eliminarPedido(index) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  if (confirm("¿Eliminar este pedido?")) {
    pedidos.splice(index, 1);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    cargarPedidos();
  }
}

// 👥 Gestión de clientes
function cargarClientes() {
  const tabla = document.getElementById("tabla-clientes");
  tabla.innerHTML = "";

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  clientes.forEach((cliente, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${cliente.nombre}</td>
      <td>${cliente.rut}</td>
      <td>${cliente.email}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.pedido_activo ? "✅" : "❌"}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${index})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function eliminarCliente(index) {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  if (confirm("¿Eliminar este cliente?")) {
    clientes.splice(index, 1);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    cargarClientes();
  }
}

// 📈 Top 10 productos más vendidos
function calcularTop10() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const conteo = {};

  pedidos.forEach((pedido) => {
    pedido.productos.forEach((prod) => {
      if (!conteo[prod.titulo]) {
        conteo[prod.titulo] = 0;
      }
      conteo[prod.titulo] += prod.cantidad;
    });
  });

  const top = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const lista = document.getElementById("top-productos");
  lista.innerHTML = "";

  if (top.length === 0) {
    lista.innerHTML = "<li class='text-muted'>No hay datos disponibles.</li>";
    return;
  }

  top.forEach(([titulo, cantidad]) => {
    const item = document.createElement("li");
    item.textContent = `${titulo} — ${cantidad} vendidos`;
    lista.appendChild(item);
  });
}
