import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import canvasConfetti from "canvas-confetti";

function Congratulation() {
  const { sectionId } = useParams();
  const [sectionName, setSectionName] = useState("");
  const [userName, setUserName] = useState(""); // Cambiado a vacío por defecto
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el nombre del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem("user")); // Aquí accedemos al objeto user completo
    if (user && user.username) {
      setUserName(user.username); // Accedemos a la propiedad 'username' en lugar de 'name'
    } else {
      setUserName("Usuario"); // Si no se encuentra el nombre, mostramos "Usuario" como fallback
    }
  }, []);

  useEffect(() => {
    const fetchSectionName = async () => {
      try {
        const response = await fetch(`http://localhost:4000/section/GetSection/${sectionId}`);
        const data = await response.json();
        if (data && data.name) {
          setSectionName(data.name);
        }
      } catch (error) {
        console.error("Error al obtener el nombre de la sección:", error);
      }
    };
    fetchSectionName();
  }, [sectionId]);

  // Lanzar confeti
  useEffect(() => {
    const canvas = document.getElementById("confetti-canvas");
    if (canvas) {
      canvasConfetti.create(canvas, {
        resize: true,
      })({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  }, []);

  // Navegar a resultados
  const handleViewResults = () => {
    navigate(`/Results/${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-green-100 flex flex-col">
      {/* Barra superior */}
      <header className="bg-white text-white py-4 shadow-2xl fixed top-0 left-0 w-full z-20">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          {/* Puedes agregar otros elementos a la barra, como un botón de salir */}
          <button 
            onClick={() => navigate('/home')} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col justify-center items-center text-center py-16 mt-20">
        {/* Contenedor canvas para confeti */}
        <canvas id="confetti-canvas" className="absolute top-0 left-0 w-full h-full z-10"></canvas>

        <h1 className="text-5xl font-bold text-green-800 z-20">¡FELICIDADES, {userName || "Usuario"}!</h1> {/* Aquí se usa userName */}
        <p className="mt-4 text-lg text-gray-700 z-20">
          Completaste las preguntas de la sección: <span className="font-semibold">{sectionName}</span>
        </p>

        <p className="mt-6 text-lg text-gray-700 z-20">
          ¿Te gustaría ver tus resultados?
        </p>

        <div className="mt-6 z-20">
          <button 
            onClick={handleViewResults} 
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Ver resultados
          </button>
        </div>
      </div>
    </div>
  );
}

export default Congratulation;
