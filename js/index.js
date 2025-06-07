document.addEventListener("DOMContentLoaded", () => {
  cargarAPI();
  document
    .getElementById("form-compra")
    .addEventListener("submit", guardarCompra);
  document
    .getElementById("calcular-edad")
    .addEventListener("click", calcularEdad);
  document
    .getElementById("encriptar-nombre")
    .addEventListener("click", encriptarNombre);
  document
    .getElementById("btn-convertir")
    .addEventListener("click", convertirMoneda);
  document
    .getElementById("pais-envio")
    .addEventListener("change", calcularTotal);
  document.getElementById("libro").addEventListener("change", () => {
    mostrarLibro();
    calcularTotal();
  });
  document.getElementById("cantidad").addEventListener("input", calcularTotal);
  document.getElementById("descuento").addEventListener("input", calcularTotal);
  document
    .getElementById("aplicar-descuento")
    .addEventListener("click", calcularTotal);
  document.querySelectorAll("input[name='envio']").forEach((radio) => {
    radio.addEventListener("change", calcularTotal);
  });

  const modalPromo = new bootstrap.Modal(document.getElementById("modalPromo"));
  modalPromo.show();
});

// === Validación RUT ===
function validarRUT(rut) {
  rut = rut.replace(/\.|-/g, "");
  if (rut.length < 8) return false;
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1).toUpperCase();
  let suma = 0,
    multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  let dvr = 11 - (suma % 11);
  dvr = dvr === 11 ? "0" : dvr === 10 ? "K" : dvr.toString();
  return dvr === dv;
}

function guardarCompra(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const rut = document.getElementById("rut").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;
  const direccion = document.getElementById("direccion").value;
  const libro = document.getElementById("libro").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const pago = document.getElementById("pago").value;
  const envio = document.querySelector('input[name="envio"]:checked')?.value;

  if (!validarRUT(rut)) {
    alert("RUT inválido");
    return;
  }

  const compra = {
    nombre,
    rut,
    email,
    telefono,
    direccion,
    libro,
    cantidad,
    pago,
    envio,
    fecha: new Date().toLocaleDateString(),
  };

  let compras = JSON.parse(localStorage.getItem("compras")) || [];
  compras.push(compra);
  localStorage.setItem("compras", JSON.stringify(compras));
  mostrarResumen(compra);
  document.getElementById("form-compra").reset();
  calcularTotal(); // actualiza total después del reset
}

function mostrarResumen(compra) {
  const resumen = document.getElementById("resumen");
  const lista = document.getElementById("resumen-lista");
  lista.innerHTML = "";

  for (let key in compra) {
    const item = document.createElement("li");
    item.textContent = `${key}: ${compra[key]}`;
    lista.appendChild(item);
  }
  resumen.style.display = "block";
}

function calcularEdad() {
  const fecha = document.getElementById("fecha_nacimiento").value;
  if (!fecha) return;
  const nacimiento = new Date(fecha);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }
  document.getElementById("resultado-edad").textContent = `Edad: ${edad} años`;
}

function encriptarNombre() {
  const nombre = document.getElementById("nombre").value;
  const cifrado = btoa(nombre);
  document.getElementById(
    "nombre-encriptado"
  ).textContent = `Nombre encriptado: ${cifrado}`;
}

// === Mostrar imagen y precio según libro ===
function mostrarLibro() {
  const libro = document.getElementById("libro").value;
  const imagen = document.getElementById("imagen-libro");
  const precio = document.getElementById("precio-libro");

  const datos = {
    imperio_final: { img: "img/imperio.jpg", precio: 12000 },
    cementerio_animales: { img: "img/king.jpg", precio: 9500 },
    nombre_del_viento: { img: "img/nombre.jpg", precio: 13500 },
    harry_potter: { img: "img/harry.jpg", precio: 11000 },
    lotm: { img: "img/lotm.jpg", precio: 14000 },
    orgullo: { img: "img/orgullo.jpg", precio: 8000 },
  };

  if (libro && datos[libro]) {
    imagen.src = datos[libro].img;
    imagen.style.display = "block";
    precio.textContent = `Precio: $${datos[libro].precio.toLocaleString()}`;
  } else {
    imagen.style.display = "none";
    precio.textContent = "";
  }
}

// === API mindicador.cl ===
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

// === Calcular total final ===
function calcularTotal() {
  const precios = {
    imperio_final: 12000,
    cementerio_animales: 9500,
    nombre_del_viento: 13500,
    harry_potter: 11000,
    lotm: 14000,
    orgullo: 8000,
  };

  const libro = document.getElementById("libro").value;
  const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
  const envio = document.querySelector("input[name='envio']:checked");
  const descuento = document
    .getElementById("descuento")
    .value.trim()
    .toUpperCase();
  const mostrarTotal = document.getElementById("precio-final");
  const mensajeDescuento = document.getElementById("descuento-aplicado");
  const monedaDestino = document.getElementById("pais-envio").value;
  const mostrarConvertido = document.getElementById("precio-convertido");

  if (!libro || !envio) {
    mostrarTotal.textContent = "Total a pagar: $0 CLP";
    mensajeDescuento.textContent = "";
    mostrarConvertido.textContent = "";
    return;
  }

  let total = precios[libro] * cantidad;
  total += envio.value === "Exprés" ? 3000 : 1500;

  if (descuento === "FANTASIA10") {
    total *= 0.9;
    mensajeDescuento.textContent = "✅ Descuento aplicado (10%)";
  } else {
    mensajeDescuento.textContent = "";
  }

  mostrarTotal.textContent = `Total a pagar: $${Math.round(
    total
  ).toLocaleString()} CLP`;

  // Mostrar total en moneda del país
  if (monedaDestino && indicadores[monedaDestino.toLowerCase()]) {
    const tasa = indicadores[monedaDestino.toLowerCase()];
    const convertido = (total / tasa).toFixed(2);
    mostrarConvertido.textContent = `≈ ${convertido.toLocaleString()} ${monedaDestino}`;
  } else {
    mostrarConvertido.textContent = "";
  }
}

// Mostrar modal solo la primera vez
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("promoMostrada")) {
    const promo = new bootstrap.Modal(document.getElementById("modalPromo"));
    promo.show();
    localStorage.setItem("promoMostrada", "true");
  }
});
