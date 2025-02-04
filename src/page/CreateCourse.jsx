import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AuthContext from "../context/AuthContext";

function CreateCourse() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "Tecnología",
    startDate: "",
    endDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Creando curso...",
      text: "Por favor espera",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.close();
        Swal.fire("Error", "No se encontró un token. Por favor, inicia sesión de nuevo.", "error");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:4000/course/CreateCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();
      Swal.close();

      if (response.ok) {
        Swal.fire("Éxito", "El curso ha sido creado con éxito.", "success").then(() => {
          navigate("/homeMod");
        });
      } else {
        Swal.fire("Error", `No se pudo crear el curso: ${data.message || "Error desconocido"}`, "error");
      }
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  const handleBack = () => {
    navigate("/homeMod");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-50 to-gray-200 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Atrás
          </button>
          <h1 className="text-2xl font-bold text-gray-700">Crear Nuevo Curso</h1>
          <nav>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
            >
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-10">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          Configuración de Curso
        </h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          {/* Título del Curso */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">
              Título del Curso
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escribe el título del curso"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
              Descripción del Curso
            </label>
            <textarea
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe el contenido del curso"
              rows="9"
              required
            ></textarea>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="category">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={courseData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Tecnología">Tecnología</option>
              <option value="Ciencias">Ciencias</option>
              <option value="Arte">Arte</option>
              <option value="Negocios">Negocios</option>
              <option value="Humanidades">Humanidades</option>
              <option value="Seguridad">Seguridad</option>
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="startDate">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={courseData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="endDate">
                Fecha de Fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={courseData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg"
            >
              Crear Curso
            </button>
          </div>
        </form>
      </main>

      <footer className="text-center py-4 bg-gray-800 text-gray-400">
        © {new Date().getFullYear()} Mi Aplicación. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default CreateCourse;
