import React, { useContext } from "react";
import { Outlet } from "react-router-dom"; // Outlet para renderizar los componentes hijos
import Swal from "sweetalert2"; // Para SweetAlert2
import AuthContext from "../context/AuthContext"; // Contexto de autenticación

const Layout = () => {
  const { logout } = useContext(AuthContext); // Obtener la función logout
  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        logout(); // Llamar a la función logout
        window.location.href = "/login"; // Redirigir a login
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-md p-4 text-center flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Mi App</h1>

        <button
          onClick={handleLogout} // Cerrar sesión
          className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold shadow-lg"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Aquí es donde se renderiza el contenido de las rutas hijas */}
      <main className="flex-1">
        <Outlet /> {/* Se renderiza el contenido de las rutas hijas */}
      </main>
    </div>
  );
};

export default Layout; // Asegúrate de exportar como default
