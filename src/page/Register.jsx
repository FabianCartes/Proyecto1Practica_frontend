import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const videos = [
  { src: "/videos/VIDEO_CURSOS.mp4", text: "¡Inscríbete al curso que quieras!" },
  { src: "/videos/VIDEO_PREGUNTAS.mp4", text: "¡Responde preguntas para poner a prueba tu conocimiento!" },
  { src: "/videos/VIDEO_RESULTADO.mp4", text: "¡Analiza tus resultados y ve tu nivel!" },
];

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const success = await register(email, username, password);
    if (success) {
      navigate("/login");
    } else {
      alert("Error al registrar el usuario");
    }
  };

  const nextVideo = () => {
    setIsPlaying(false);
    setTimeout(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
      setIsPlaying(true);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-500">
      <header className="w-full bg-white text-zinc-800 py-4 text-center text-xl font-bold shadow-2xl">
        Mi Página Web
      </header>

      <div className="flex items-center justify-center min-h-screen px-6">
        {/* Sección de videos */}
        <div className="w-1/2 flex flex-col items-start justify-center ml-6">
          <div className="relative w-full max-w-lg overflow-hidden">
            <AnimatePresence mode="wait">
              {isPlaying && (
                <motion.div
                  key={videos[currentVideo].src}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <video
                    key={videos[currentVideo].src}
                    className="rounded-lg shadow-lg w-full h-auto"
                    autoPlay
                    muted
                    loop={false}
                    onEnded={nextVideo}
                  >
                    <source src={videos[currentVideo].src} type="video/mp4" />
                    Tu navegador no soporta videos.
                  </video>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Indicadores de video y texto */}
          <div className="w-full flex flex-col items-center mt-4" style={{ transform: 'translateX(-170px)' }}>
            <div className="flex space-x-2">
              {videos.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentVideo ? "bg-white scale-125" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-lg font-semibold text-white text-center">
              {videos[currentVideo].text}
            </p>
          </div>
        </div>

        {/* Sección de registro */}
        <div className="w-1/2 bg-white p-8 rounded-lg shadow-2xl max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Regístrate</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
              <input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
              Regístrate
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta? <a href="/login" className="text-blue-500 hover:underline">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;