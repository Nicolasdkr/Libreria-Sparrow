document.addEventListener("DOMContentLoaded", () => {
  cargarAPI();
  configurarEventos();
});

function configurarEventos() {
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
  document.querySelectorAll("input[name='envio']").forEach((radio) =>
    radio.addEventListener("change", () => {
      actualizarEnvioTexto(radio.value);
      calcularTotal();
    })
  );
}

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
  const pais = document.getElementById("pais-envio").value;

  if (!validarRUT(rut)) {
    alert("RUT inválido");
    return;
  }

  const hoy = new Date();
  let fechaEntrega = new Date(hoy);
  let costoEnvio = 0;

  if (envio === "Exprés") {
    fechaEntrega.setDate(hoy.getDate() + 7);
    costoEnvio = 3000;
  } else if (envio === "Estándar") {
    fechaEntrega.setDate(hoy.getDate() + 21);
    costoEnvio = 1500;
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
    pais,
    fecha: hoy.toLocaleDateString(),
    fechaEntrega: fechaEntrega.toLocaleDateString(),
    costoEnvio,
  };

  const compras = JSON.parse(localStorage.getItem("compras")) || [];
  compras.push(compra);
  localStorage.setItem("compras", JSON.stringify(compras));
  mostrarResumen(compra);
  document.getElementById("form-compra").reset();
  calcularTotal();
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

function mostrarLibro() {
  const libro = document.getElementById("libro").value;
  const imagen = document.getElementById("imagen-libro");
  const precio = document.getElementById("precio-libro");

  if (libros[libro]) {
    imagen.src = libros[libro].imagen;
    imagen.style.display = "block";
    precio.textContent = `Precio: $${libros[libro].precio.toLocaleString()}`;
  } else {
    imagen.style.display = "none";
    precio.textContent = "";
  }
}

// Libros disponibles
const libros = {
  imperio_final: {
    nombre: "El Imperio Final",
    precio: 12000,
    imagen: "img/portadas_libros/imperio_final.jpg",
  },
  cementerio_animales: {
    nombre: "Cementerio de Animales",
    precio: 9500,
    imagen: "img/portadas_libros/cementerio_de_animales.jpg",
  },
  nombre_del_viento: {
    nombre: "El Nombre del Viento",
    precio: 13500,
    imagen: "img/portadas_libros/nombre_del_viento.jpg",
  },
  harry_potter: {
    nombre: "Harry Potter",
    precio: 11000,
    imagen: "img/portadas_libros/harry_potter.jpg",
  },
  lotm: {
    nombre: "Lord of the Mysteries",
    precio: 14000,
    imagen: "img/portadas_libros/lotm.jpg",
  },
  orgullo: {
    nombre: "Orgullo y Prejuicio",
    precio: 8000,
    imagen: "img/portadas_libros/orgullo.jpg",
  },
};

// === API de indicadores ===
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

function convertirMoneda() {
  const monto = parseFloat(document.getElementById("convertir-monto").value);
  const tipo = document.getElementById("convertir-moneda").value;
  if (!monto || !indicadores[tipo]) return;
  const resultado = (monto / indicadores[tipo]).toFixed(2);
  document.getElementById(
    "resultado-conversion"
  ).textContent = `${resultado} ${tipo.toUpperCase()}`;
}

// === Cálculo de total ===
function calcularTotal() {
  const libro = document.getElementById("libro").value;
  const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
  const envio = document.querySelector("input[name='envio']:checked");
  const descuento = document
    .getElementById("descuento")
    .value.trim()
    .toUpperCase();
  const pais = document.getElementById("pais-envio").value;
  const mostrarTotal = document.getElementById("precio-final");
  const mensajeDescuento = document.getElementById("descuento-aplicado");
  const mostrarConvertido = document.getElementById("precio-convertido");

  if (!libro || !envio) {
    mostrarTotal.textContent = "Total a pagar: $0 CLP";
    mensajeDescuento.textContent = "";
    mostrarConvertido.textContent = "";
    return;
  }

  let total = libros[libro].precio * cantidad;
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

  if (pais && pais !== "CLP") {
    const tipo = pais.toLowerCase();
    const tasa = indicadores[tipo];
    if (tasa) {
      const convertido = (total / tasa).toFixed(2);
      mostrarConvertido.textContent = `≈ ${convertido.toLocaleString()} ${pais}`;
    }
  } else {
    mostrarConvertido.textContent = "";
  }
}

function actualizarEnvioTexto(valor) {
  const infoEnvio = document.getElementById("info-envio");
  const hoy = new Date();
  const fecha = new Date(hoy);
  let mensaje = "";

  if (valor === "Exprés") {
    fecha.setDate(hoy.getDate() + 7);
    mensaje = `Tu pedido llegará en aproximadamente 1 semana (${fecha.toLocaleDateString()}).`;
  } else {
    fecha.setDate(hoy.getDate() + 21);
    mensaje = `Tu pedido llegará en aproximadamente 3 semanas (${fecha.toLocaleDateString()}).`;
  }

  infoEnvio.textContent = mensaje;
  infoEnvio.style.color = "blue";
}

// === Resumen ===
function mostrarResumen(compra) {
  const resumen = document.getElementById("resumen");
  const lista = document.getElementById("resumen-lista");
  lista.innerHTML = "";

  const datos = [
    { etiqueta: "Nombre", valor: compra.nombre },
    { etiqueta: "RUT", valor: compra.rut },
    { etiqueta: "Email", valor: compra.email },
    { etiqueta: "Teléfono", valor: compra.telefono },
    { etiqueta: "Dirección", valor: compra.direccion },
    { etiqueta: "Libro", valor: formatearLibro(compra.libro) },
    { etiqueta: "Cantidad", valor: compra.cantidad },
    { etiqueta: "Método de Pago", valor: compra.pago },
    { etiqueta: "Tipo de Envío", valor: compra.envio },
    { etiqueta: "País", valor: compra.pais },
    { etiqueta: "Fecha de Compra", valor: compra.fecha },
  ];

  datos.forEach((d) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${d.etiqueta}:</strong> ${d.valor}`;
    lista.appendChild(item);
  });

  const precioLibro = libros[compra.libro]?.precio || 0;
  const totalLibros = precioLibro * compra.cantidad;
  const totalFinal = totalLibros + (compra.costoEnvio || 0);

  const extras = [
    {
      etiqueta: "Entrega Estimada",
      valor: `${compra.envio} - ${compra.fechaEntrega}`,
    },
    {
      etiqueta: "Costo de Envío",
      valor: `$${(compra.costoEnvio || 0).toLocaleString()}`,
    },
    { etiqueta: "Total a Pagar", valor: `$${totalFinal.toLocaleString()}` },
  ];

  extras.forEach((d) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${d.etiqueta}:</strong> ${d.valor}`;
    lista.appendChild(item);
  });

  resumen.style.display = "block";
}

function formatearLibro(valor) {
  const libros = {
    imperio_final: "El Imperio Final - $12.000",
    cementerio_animales: "Cementerio de Animales - $9.500",
    nombre_del_viento: "El Nombre del Viento - $13.500",
    harry_potter: "Harry Potter - $11.000",
    lotm: "Lord of the Mysteries - $14.000",
    orgullo: "Orgullo y Prejuicio - $8.000",
  };
  return libros[valor] || valor;
}
