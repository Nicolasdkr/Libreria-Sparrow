const CLAVE_CORRECTA = "admin123";

function verificarClave() {
  const clave = document.getElementById("clave-admin").value;
  const mensaje = document.getElementById("mensaje-clave");

  if (clave === CLAVE_CORRECTA) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";

    // Cuando el login es correcto, mostramos las compras
    renderCompras();
  } else {
    mensaje.textContent = "⚠️ Clave incorrecta. Inténtalo de nuevo.";
  }
}

const libros = JSON.parse(localStorage.getItem("libros")) || [];

function renderTablaLibros() {
  const tbody = document.getElementById("tabla-libros");
  tbody.innerHTML = "";
  libros.forEach((libro, i) => {
    const fila = `
      <tr>
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>$${libro.precio}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editarLibro(${i})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarLibro(${i})">Eliminar</button>
        </td>
      </tr>`;
    tbody.innerHTML += fila;
  });
}

document.getElementById("form-libro").addEventListener("submit", function (e) {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const autor = document.getElementById("autor").value;
  const precio = document.getElementById("precio").value;

  libros.push({ titulo, autor, precio });
  localStorage.setItem("libros", JSON.stringify(libros));
  renderTablaLibros();
  this.reset();
});

function eliminarLibro(index) {
  libros.splice(index, 1);
  localStorage.setItem("libros", JSON.stringify(libros));
  renderTablaLibros();
}

function editarLibro(index) {
  const libro = libros[index];
  document.getElementById("titulo").value = libro.titulo;
  document.getElementById("autor").value = libro.autor;
  document.getElementById("precio").value = libro.precio;
  eliminarLibro(index);
}

renderTablaLibros();

// Función para mostrar compras guardadas
function renderCompras() {
  const compras = JSON.parse(localStorage.getItem("compras")) || [];
  const contenedor = document.getElementById("lista-compras");

  if (!contenedor) {
    console.warn("No se encontró el contenedor de compras (#lista-compras)");
    return;
  }

  contenedor.innerHTML = "";

  if (compras.length === 0) {
    contenedor.innerHTML = "<p>No hay compras registradas.</p>";
    return;
  }

  compras.forEach((compra, i) => {
    const div = document.createElement("div");
    div.classList.add("compra-item");
    div.style.border = "1px solid #ccc";
    div.style.marginBottom = "10px";
    div.style.padding = "8px";
    div.innerHTML = `
      <strong>Compra #${i + 1}</strong><br>
      Nombre: ${compra.nombre} <br>
      RUT: ${compra.rut} <br>
      Email: ${compra.email} <br>
      Teléfono: ${compra.telefono} <br>
      Dirección: ${compra.direccion} <br>
      Libro: ${compra.libro} <br>
      Cantidad: ${compra.cantidad} <br>
      Pago: ${compra.pago} <br>
      Envío: ${compra.envio} <br>
      Fecha: ${compra.fecha}
    `;
    contenedor.appendChild(div);
  });
}
