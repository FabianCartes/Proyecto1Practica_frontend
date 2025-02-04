import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importa SweetAlert2
import AuthContext from "../context/AuthContext";

function HomeNormal() {
  const { logout, user } = useContext(AuthContext); // Usamos el método logout del contexto
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("available"); // Estado para controlar la pestaña activa
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const checkAndUpdateCourses = async () => {
      const now = new Date();
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // 11:59:59 PM
  
      const token = localStorage.getItem("token");
  
      for (const course of courses) {
        const endDate = new Date(course.endDate);
        
        if (endDate <= todayEnd && course.isPublic) {
          try {
            const response = await fetch(`http://localhost:4000/course/toggleVisibility/${course.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ isPublic: false }), // Enviamos el nuevo estado
            });
  
            if (response.ok) {
              console.log(`El curso "${course.title}" ahora es privado.`);
              fetchCourses(); // Recargar los cursos actualizados
            } else {
              console.error(`Error al actualizar el curso "${course.title}".`);
            }
          } catch (error) {
            console.error("Error en la petición de actualización:", error);
          }
        }
      }
    };
  
    checkAndUpdateCourses();
  }, [courses]);
  

  // Obtener los cursos públicos desde el backend
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/course/GetPublicCourses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los cursos públicos");
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error al cargar los cursos públicos:", error);
    }
  };

  // Obtener los cursos en los que el usuario está inscrito
  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/inscription/MyInscriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Error al obtener los cursos inscritos");
      }
  
      const data = await response.json();
      setEnrolledCourses(data);
    } catch (error) {
      console.error("Error al cargar los cursos inscritos:", error);
    }
  };
  

  const formatEndDate = (endDate) => {
    const date = new Date(endDate);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isOneDayLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return diffTime <= oneDayInMs && diffTime > 0;
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const renderCourses = (coursesList) => {
    return coursesList.length > 0 ? (
      <ul className="space-y-4">
        {coursesList.map((course) => {
          // Verifica si el usuario ya está inscrito en el curso
          const isEnrolled = enrolledCourses.some((enrolled) => enrolled.id === course.id);
  
          return (
            <li
              key={course.id}
              className="p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm"
            >
              <h4 className="text-xl font-bold text-gray-700">{course.title}</h4>
              <p className="text-gray-600">{course.description}</p>
              <div className="mt-2">
                <span
                  className={`text-sm font-semibold ${
                    isOneDayLeft(course.endDate) ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  Fecha de término: {formatEndDate(course.endDate)}{" "}
                  <span className="font-normal">(11:59PM)</span>
                </span>
              </div>
  
              {activeTab !== "enrolled" && (
                <p className="text-sm text-gray-500">
                  Creado por: <strong>{course.createdBy?.username || "Desconocido"}</strong>
                </p>
              )}
  
              {activeTab === "available" && (
                <div className="flex justify-end mt-4">
                  {isEnrolled ? (
                    <button
                      className="bg-green-500 text-white px-6 py-3 rounded-md font-semibold shadow-lg cursor-not-allowed"
                      disabled
                    >
                      Ya estás inscrito
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg"
                      onClick={() => handleEnrollConfirm(course)}
                    >
                      Inscribirme
                    </button>
                  )}
                </div>
              )}
  
              {activeTab === "enrolled" && (
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold shadow-lg"
                    onClick={() => navigate(`/Course/${course.id}`)}
                  >
                    Entrar
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold shadow-lg"
                    onClick={() => handleUnenrollConfirm(course.id)}
                  >
                    Desinscribirme
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="text-gray-600">No hay cursos disponibles.</p>
    );
  };
  
  
  

  const handleEnrollConfirm = (course) => {
    Swal.fire({
      title: `¿Quieres inscribirte en este curso?`,
      html: `
        <h3 class="text-xl font-bold text-gray-700">${course.title}</h3>
        <p class="text-lg text-gray-600 my-2">${course.description}</p>
        <p class="text-sm text-gray-500">Fecha de término: ${formatEndDate(course.endDate)}</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, inscribirme",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        handleEnroll(course.id); // Inscribirse al curso
      }
    });
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
    }).then((result) => {
      if (result.isConfirmed) {
        logout(); // Llamamos a la función logout del contexto
        navigate("/login"); // Navegamos a la página de inicio de sesión
      }
    });
  };


  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:4000/inscription/Enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });
  
      if (!response.ok) {
        throw new Error("Error al inscribirse en el curso");
      }
  
      Swal.fire("¡Inscripción exitosa!", "Te has inscrito en el curso.", "success");
  
      // Refrescar la lista de cursos inscritos
      fetchEnrolledCourses();
    } catch (error) {
      console.error("Error al inscribirse en el curso:", error);
      Swal.fire("Error", "No se pudo completar la inscripción.", "error");
    }
  };

  const handleUnenrollConfirm = (courseId) => {
    Swal.fire({
      title: "¿Seguro que quieres desinscribirte?",
      text: "Se eliminará tu inscripción en este curso.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desinscribirme",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        handleUnenroll(courseId);
      }
    });
  };

  const handleUnenroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`http://localhost:4000/inscription/Unenroll/${courseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Error al desinscribirse del curso");
      }
  
      Swal.fire("¡Desinscripción exitosa!", "Has salido del curso.", "success");
  
      // Refrescar la lista de cursos inscritos
      fetchEnrolledCourses();
    } catch (error) {
      console.error("Error al desinscribirse:", error);
      Swal.fire("Error", "No se pudo completar la desinscripción.", "error");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-700">
            Bienvenido a tu portal de cursos
          </h1>
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
          Aquí puedes gestionar tus cursos.
        </p>

        <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-6 py-3 font-semibold ${
              activeTab === "available"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("available")}
          >
            Cursos Disponibles
          </button>
          <button
            className={`px-6 py-3 font-semibold ${
              activeTab === "enrolled"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("enrolled")}
          >
            Cursos Inscritos
          </button>
        </div>

        {activeTab === "available" && (
          <section className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
            {renderCourses(courses)}
          </section>
        )}
        {activeTab === "enrolled" && (
          <section className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
            {renderCourses(enrolledCourses)}
          </section>
        )}
      </main>

      <footer className="text-center py-4 bg-gray-800 text-gray-400 mt-10">
        © {new Date().getFullYear()} Mi Aplicación. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default HomeNormal;
