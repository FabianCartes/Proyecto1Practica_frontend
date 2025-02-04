import React, { useEffect, useState, useContext} from 'react';
import { useParams } from 'react-router-dom'; // Para obtener el ID del curso desde la URL
import Swal from 'sweetalert2'; // Importa SweetAlert2
import { useNavigate } from 'react-router-dom';
import AuthContext from "../context/AuthContext";

function Course() {
  const { courseId } = useParams(); // Obtener el ID del curso desde la URL
  const [course, setCourse] = useState(null); // Estado para almacenar la información del curso
  const [sections, setSections] = useState([]); // Estado para almacenar las secciones del curso
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();


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
  


  // Función para obtener el curso
  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem('token');
  
      // Obtener los detalles del curso
      const courseResponse = await fetch(`http://localhost:4000/course/GetCourse/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!courseResponse.ok) throw new Error('Error al obtener los detalles del curso');
  
      const courseData = await courseResponse.json();
      setCourse(courseData);
  
      // Obtener las secciones del curso
      const sectionResponse = await fetch(`http://localhost:4000/section/GetSectionsByCourse/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!sectionResponse.ok) throw new Error('Error al obtener las secciones del curso');
  
      const sectionsData = await sectionResponse.json();
  
      // Para cada sección, obtener sus preguntas
      const sectionsWithQuestions = await Promise.all(
        sectionsData.map(async (section) => {
          const questionResponse = await fetch(`http://localhost:4000/question/GetQuestionBySection/${section.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const questions = await questionResponse.json();
          return { ...section, questions }; // Agregar preguntas a la sección
        })
      );
  
      setSections(sectionsWithQuestions);
    } catch (error) {
      console.error('Error al cargar los detalles del curso:', error);
      Swal.fire('Error', 'No se pudo cargar la información del curso.', 'error');
    }
  };
  

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  if (!course) {
    return <p>Cargando curso...</p>;
  }

  const formatEndDate = (endDate) => {
    const date = new Date(endDate);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Función para obtener la miniatura del video de YouTube
  const getVideoThumbnail = (videoUrl) => {
    const videoId = videoUrl.split('v=')[1]; // Extraer el ID del video de YouTube
    return `https://img.youtube.com/vi/${videoId}/0.jpg`; // URL de la miniatura
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 text-gray-800">
      <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">{course.title}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>

      <main className="px-6 py-10">
        <section className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
        <button
        onClick={() => navigate('/home')} // Redirige a la página de inicio
        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg mt-6"
        >
        Volver atrás
        </button>
          <h2 className="text-4xl font-bold text-center mb-4">{course.title}</h2>
          <p className="text-lg text-gray-600 text-center mb-4">{course.description}</p>
          <p className="text-center text-gray-500">Categoría: <strong>{course.category || 'No definida'}</strong></p>
          <p className="text-center text-gray-500">Fecha de término: <strong>{formatEndDate(course.endDate)}</strong></p>

          <div className="mt-6">
            <h3 className="text-2xl font-semibold mb-4">Secciones</h3>
            {sections.length > 0 ? (
              <ul className="space-y-4">
              {sections.map((section) => (
                <li key={section.id} className="p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-sm relative">
                  <h4 className="text-xl font-bold text-gray-700">{section.name}</h4>
                  <p className="text-gray-600">{section.description}</p>
            
                  {/* Miniatura del video */}
                  {section.videoLink && (
                    <div className="mt-4 flex flex-col items-center">
                      <a href={section.videoLink} target="_blank" rel="noopener noreferrer">
                        <img
                          src={getVideoThumbnail(section.videoLink)}
                          alt="Miniatura del video"
                          className="w-50 h-50 object-cover rounded-md shadow-md cursor-pointer"
                        />
                      </a>
                      <p className="mt-2 mb-6 text-lg text-gray-600 text-center">Haz clic para ver el video</p>
                    </div>
                  )}
            
                  {/* Tiempo de la sección en la esquina inferior izquierda */}
                  <div className="absolute bottom-2 left-2 text-base text-gray-700 font-semibold">
                    Tiempo de la sección: 
                    <span className="bg-red-500 text-white px-2 py-1 rounded-md ml-2">
                        {section.totalTime ? `${section.totalTime} min` : "Sin tiempo"}
                    </span>
                  </div>

                  {section.questions && section.questions.length > 0 && (
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg"
                        onClick={() => {
                          Swal.fire({
                            title: "⚠️ Advertencia",
                            text: section.totalTime && section.totalTime > 0 
                              ? `¿Estás seguro de empezar a responder? Tienes ${section.totalTime} minutos para completar las preguntas.` 
                              : "¿Estás seguro de empezar a responder?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Sí, empezar",
                            cancelButtonText: "Cancelar",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              navigate(`/Question/${section.id}`);
                            }
                          });
                        }}
                      >
                        Empezar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>            
            ) : (
              <p className="text-gray-600">Este curso no tiene secciones.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="text-center py-4 bg-gray-800 text-gray-400 mt-10">
        © {new Date().getFullYear()} Mi Aplicación. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default Course;
