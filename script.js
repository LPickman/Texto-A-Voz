let mensaje; // Variable global para almacenar el mensaje de síntesis
let intervaloProgreso; // Variable para el intervalo de progreso
let progresoActual = 0; // Variable para el progreso actual
let duracionEstimada; // Variable para la duración estimada del texto

function calcularDuracionEstimada(texto) {
  const palabrasPorMinuto = 150; // Velocidad media de habla
  const palabras = texto.split(" ").length;
  return (palabras / palabrasPorMinuto) * 60 * 1000; // Duración en milisegundos
}

function actualizarBarraProgreso() {
  const barraProgreso = document.getElementById("barraProgreso");
  const progresoTexto = document.getElementById("progresoTexto");
  progresoActual += 100; // Actualiza cada 100 ms
  const progreso = Math.min((progresoActual / duracionEstimada) * 100, 100);
  barraProgreso.value = progreso;
  progresoTexto.textContent = `Progreso: ${Math.round(progreso)}%`;
}

function convertirTextoAVoz(velocidad = 1) {
  const texto = document.getElementById("texto").value;

  if ("speechSynthesis" in window) {
    if (mensaje) {
      window.speechSynthesis.cancel();
    }

    mensaje = new SpeechSynthesisUtterance();
    mensaje.text = texto;
    mensaje.lang = "es-ES";
    mensaje.rate = velocidad;

    duracionEstimada = calcularDuracionEstimada(texto) / velocidad;
    progresoActual = 0;

    window.speechSynthesis.speak(mensaje);

    mensaje.onend = () => {
      console.log(`Texto reproducido a velocidad ${velocidad}x.`);
      mensaje = null;
      clearInterval(intervaloProgreso);
      document.getElementById("barraProgreso").value = 100;
      document.getElementById("progresoTexto").textContent = "Progreso: 100%";
    };

    clearInterval(intervaloProgreso); // Asegurarse de que no hay otro intervalo en ejecución
    intervaloProgreso = setInterval(actualizarBarraProgreso, 100);
  } else {
    console.error("La API Web Speech no es compatible con este navegador.");
  }
}

function pausar() {
  if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    clearInterval(intervaloProgreso);
    console.log("Reproducción pausada.");
  }
}

function continuar() {
  if ("speechSynthesis" in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    intervaloProgreso = setInterval(actualizarBarraProgreso, 100);
    console.log("Reproducción continuada.");
  }
}

document.getElementById("barraProgreso").addEventListener("input", (event) => {
  const nuevaPosicion = event.target.value;
  progresoActual = (nuevaPosicion / 100) * duracionEstimada;
  if (mensaje) {
    window.speechSynthesis.cancel();
    const texto = document.getElementById("texto").value;
    const indiceInicio = Math.floor((nuevaPosicion / 100) * texto.length);
    const textoRestante = texto.slice(indiceInicio);

    mensaje = new SpeechSynthesisUtterance();
    mensaje.text = textoRestante;
    mensaje.lang = "es-ES";
    mensaje.rate = 1; // Puedes ajustar la velocidad aquí
    window.speechSynthesis.speak(mensaje);

    mensaje.onend = () => {
      console.log("Texto reproducido.");
      clearInterval(intervaloProgreso);
      document.getElementById("barraProgreso").value = 100;
      document.getElementById("progresoTexto").textContent = "Progreso: 100%";
    };

    clearInterval(intervaloProgreso); // Asegurarse de que no hay otro intervalo en ejecución
    intervaloProgreso = setInterval(actualizarBarraProgreso, 100);
  }
});
