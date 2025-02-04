import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import AuthContext from "../context/AuthContext";
import { FaExclamationTriangle } from "react-icons/fa"; // Importamos el ícono de advertencia

function HomeMod() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/course/GetCourse/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los cursos");
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará el curso junto a los usuarios inscritos.  No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminarlo",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/course/DeleteCourse/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el curso");
      }

      const data = await response.json();
      Swal.fire("Eliminado", data.message, "success");

      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error("Error al eliminar el curso:", error);
      Swal.fire("Error", "No se pudo eliminar el curso.", "error");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "animate__animated animate__fadeInDown",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  const toggleCourseVisibility = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/course/toggleVisibility/${courseId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cambiar el estado del curso");
      }

      const data = await response.json();
      Swal.fire("Éxito", data.message, "success");

      // Actualizar la lista de cursos
      fetchCourses();
    } catch (error) {
      console.error("Error al cambiar el estado del curso:", error);
      Swal.fire("Error", "No se pudo cambiar el estado del curso.", "error");
    }
  };

  const handleCreateCourse = () => {
    navigate("/createCourse");
  };

  const handleEditCourse = (courseId) => {
    console.log("courseId recibido:", courseId); // Verifica el valor aquí
    navigate(`/editCourse/${courseId}`);
  };

  const getRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convierte de milisegundos a días
    return diffDays;
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-700">Panel de Moderador</h1>
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

      <main className="px-6 py-10">
        <h2 className="text-4xl font-bold mb-6 text-center text-gray-700">
          Bienvenido, {user?.username} 👋
        </h2>
        <p className="text-xl mb-10 text-center text-gray-600">
          Aquí puedes gestionar los cursos que estarán disponibles para los usuarios.
        </p>

        <div className="flex justify-center mb-10">
          <button
            onClick={handleCreateCourse}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg"
          >
            Crear Nuevo Curso
          </button>
        </div>

        <section className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-700">Tus Cursos Actuales</h3>
          {courses.length > 0 ? (
            <ul className="space-y-4">
              {courses.map((course) => {
                const remainingDays = getRemainingDays(course.endDate);
                const isWarning = remainingDays === 1;
                return (
                  <li key={course.id} className="p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm">
                    <h4 className="text-xl font-bold text-gray-700">{course.title}</h4>
                    <p className="text-gray-600">{course.description}</p>

                    <p
                      className={`text-sm ${
                        isWarning ? "text-red-600" : "text-gray-500"
                      } flex justify-end items-center mt-2`}
                    >
                      {isWarning && <FaExclamationTriangle className="mr-2 text-red-600" />}
                      <span>
                        Fecha de Término: {new Date(course.endDate).toLocaleDateString("es-ES")}{" "}
                        <span>(11:59PM)</span>
                      </span>
                    </p>

                    <p className="text-sm text-gray-500">
                      Creado por: <strong>{course.createdBy?.username || "Desconocido"}</strong>
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      {/* Toggle para cambiar entre público/privado */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {course.isPublic ? "Público" : "Privado"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={course.isPublic}
                            className="sr-only peer"
                            onChange={() => toggleCourseVisibility(course.id)}
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                          onClick={() => handleEditCourse(course.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-md"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-600">No hay cursos disponibles.</p>
          )}
        </section>
      </main>

      <footer className="text-center py-4 bg-gray-800 text-gray-400 mt-10">
        © {new Date().getFullYear()} Mi Aplicación. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default HomeMod;
