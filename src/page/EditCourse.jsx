import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import AuthContext from "../context/AuthContext";

function EditCourse() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


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

  const fetchCourseData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Obtener datos del curso
      const courseResponse = await fetch(
        `http://localhost:4000/course/GetCourse/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!courseResponse.ok) {
        throw new Error("Error al obtener los datos del curso");
      }

      const courseData = await courseResponse.json();

      // Obtener secciones asociadas al curso
      const sectionsResponse = await fetch(
        `http://localhost:4000/section/GetSectionsByCourse/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!sectionsResponse.ok) {
        throw new Error("Error al obtener las secciones del curso");
      }

      const sectionsData = await sectionsResponse.json();

      // Actualizar estado con datos del curso y las secciones
      setCourseData({
        title: courseData.title || "",
        description: courseData.description || "",
        category: courseData.category || "",
        startDate: courseData.startDate || "",
        endDate: courseData.endDate || "",
      });

      setSections(sectionsData || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar los datos del curso:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/course/UpdateCourse/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...courseData, sections }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar los cambios del curso");
      }

      Swal.fire("Éxito", "Los cambios se han guardado correctamente", "success");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      Swal.fire("Error", "Hubo un problema al guardar los cambios", "error");
    }
  };

  // Esta función ahora se asegura de enviar las secciones correctas al backend
  const handleSaveSections = async (newSection) => {
    try {
      const token = localStorage.getItem("token");
  
      console.log("Sección a guardar:", newSection);
  
      const response = await fetch("http://localhost:4000/section/CreateSection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSection),
      });
  
      const responseData = await response.json();
      console.log("Respuesta del backend:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || "Error al guardar la sección");
      }
  
      // Recargar las secciones
      fetchCourseData();
  
      Swal.fire("Éxito", "La sección se ha guardado correctamente", "success");
    } catch (error) {
      console.error("Error al guardar la sección:", error);
      Swal.fire("Error", "Hubo un problema al guardar la sección", "error");
    }
  };
  
  
  
  // Función para añadir sección
  const addSection = () => {
    Swal.fire({
      title: "Añadir Sección",
      html: `
        <label for="section-title" class="block text-xl font-medium text-gray-700">Título de la sección</label>
        <input id="section-title" class="swal2-input py-3 px-4 text-lg" placeholder="Título de la sección" />
  
        <label for="section-description" class="block text-xl font-medium text-gray-700 mt-4">Descripción de la sección</label>
        <textarea id="section-description" class="swal2-textarea py-3 px-4 text-lg" placeholder="Descripción de la sección"></textarea>
  
        <label for="section-order" class="block text-xl font-medium text-gray-700 mt-4">Orden de la sección</label>
        <input id="section-order" class="swal2-input py-3 px-4 text-lg" type="number" placeholder="Orden de la sección" />
  
        <label for="section-videoLink" class="block text-xl font-medium text-gray-700 mt-4">Enlace de material adicional (opcional)</label>
        <input id="section-videoLink" class="swal2-input py-3 px-4 text-lg" placeholder="Enlace de material adicional (opcional)" />
      `,
      confirmButtonText: "Aceptar",
      showCancelButton: true,
      preConfirm: () => {
        const title = document.getElementById("section-title").value;
        const description = document.getElementById("section-description").value;
        const order = document.getElementById("section-order").value;
        const videoLink = document.getElementById("section-videoLink").value;
  
        if (!title || !description || !order) {
          Swal.showValidationMessage("Por favor, complete todos los campos obligatorios.");
          return;
        }
  
        return { title, description, order, videoLink };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newSection = {
          name: result.value.title,
          description: result.value.description,
          order: parseInt(result.value.order),  // Aseguramos que sea un número
          videoLink: result.value.videoLink,
          courseId: Number(courseId),
        };
  
        handleSaveSections(newSection);
        Swal.fire("Éxito", "Sección añadida correctamente", "success");
      }
    });
  };
  

// Función para editar sección
const editSection = (id) => {
  const sectionToEdit = sections.find((section) => section.id === id);

  Swal.fire({
    title: "Editar Sección",
    html: `
      <label for="edit-title" class="block text-xl font-medium text-gray-700">Título de la sección</label>
      <input id="edit-title" class="swal2-input py-3 px-4 text-lg" value="${sectionToEdit.name}" />

      <label for="edit-description" class="block text-xl font-medium text-gray-700 mt-4">Descripción de la sección</label>
      <textarea id="edit-description" class="swal2-textarea py-3 px-4 text-lg">${sectionToEdit.description}</textarea>

      <label for="edit-order" class="block text-xl font-medium text-gray-700 mt-4">Orden de la sección</label>
      <input id="edit-order" class="swal2-input py-3 px-4 text-lg" type="number" value="${sectionToEdit.order}" />

      <label for="edit-videoLink" class="block text-xl font-medium text-gray-700 mt-4">Enlace de material adicional (opcional)</label>
      <input id="edit-videoLink" class="swal2-input py-3 px-4 text-lg" value="${sectionToEdit.videoLink || ''}" placeholder="Enlace de material adicional (opcional)" />
    `,
    confirmButtonText: "Confirmar",
    showCancelButton: true,
    preConfirm: () => {
      const title = document.getElementById("edit-title").value;
      const description = document.getElementById("edit-description").value;
      const order = document.getElementById("edit-order").value;
      const videoLink = document.getElementById("edit-videoLink").value;

      if (!title || !description || !order) {
        Swal.showValidationMessage("Por favor, complete todos los campos obligatorios.");
        return;
      }

      return { title, description, order, videoLink };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const updatedSection = {
        ...sectionToEdit,
        name: result.value.title,
        description: result.value.description,
        order: parseInt(result.value.order),  // Aseguramos que sea un número
        videoLink: result.value.videoLink,
      };

      setSections(
        sections.map((section) =>
          section.id === id ? updatedSection : section
        )
      );

      const token = localStorage.getItem("token");
      fetch(`http://localhost:4000/section/UpdateSection/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSection),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al actualizar la sección en la base de datos");
          }
          Swal.fire("Éxito", "Sección actualizada correctamente", "success");
        })
        .catch((error) => {
          console.error("Error al actualizar la sección:", error);
          Swal.fire("Error", "Hubo un problema al actualizar la sección", "error");
        });
    }
  });
};


  const deleteSection = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta sección será eliminada permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedSections = sections.filter((section) => section.id !== id);
        setSections(updatedSections);

        const token = localStorage.getItem("token");
        fetch(`http://localhost:4000/section/DeleteSection/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error al eliminar la sección");
            }
            Swal.fire("Eliminado", "Sección eliminada correctamente", "success");
          })
          .catch((error) => {
            console.error("Error al eliminar la sección:", error);
            Swal.fire("Error", "Hubo un problema al eliminar la sección", "error");
          });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl font-semibold text-gray-700">Cargando...</p>
      </div>
    );
  }

  const getYouTubeID = (url) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };


  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-700">Edición de Curso</h1>
          <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
            >
              Cerrar Sesión
            </button>
        </div>
      </header>
  
      <main className="px-4 py-10 space-y-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold shadow-lg"
          >
            Volver Atrás
          </button>
        </div>
  
        {/* Sección de Información Principal */}
        <section className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto space-y-8">
          <div className="w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Información Principal</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Título del curso"
              />
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Descripción del curso"
              />
              <input
                type="text"
                name="category"
                value={courseData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Categoría"
              />
              <div className="flex space-x-4">
                <input
                  type="date"
                  name="startDate"
                  value={courseData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="date"
                  name="endDate"
                  value={courseData.endDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <button
              onClick={handleSaveChanges}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 mt-6 rounded-md font-semibold shadow-lg"
            >
              Guardar Cambios
            </button>
          </div>
        </section>
  
        {/* Contenedor Responsivo */}
        <div className="flex flex-col md:flex-row md:space-x-10 gap-6">
          {/* Sección de Agregar y Modificar Secciones */}
          <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar y Modificar Secciones</h2>
            <div className="space-x-4">
              <button
                onClick={addSection}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg mb-4"
              >
                Añadir Sección
              </button>
            </div>
  
            {/* Lista de secciones */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-700">Secciones creadas</h3>
              {sections.map((section) => (
                <div key={section.id} className="bg-gray-100 p-4 rounded-md shadow-sm mb-4 relative">
                  <h4 className="text-lg font-semibold">{section.name}</h4>
                  
                  {/* Mostrar el orden de la sección en la esquina superior derecha */}
                  <span className="absolute top-2 right-2 text-sm font-medium text-gray-600">
                    ORDEN: {section.order}
                  </span>
                  
                  <p>{section.description}</p>
                  {section.material && (
                    <p>
                      <strong>Material Adicional: </strong>
                      <a
                        href={section.material}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Ver material
                      </a>
                    </p>
                  )}
                  <div className="mt-2 flex space-x-4">
                    <button
                      onClick={() => editSection(section.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => navigate(`/CreateQuestion/${section.id}`)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
                    >
                      Agregar Pregunta
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
  
          {/* Sección de Previsualización */}
          <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Previsualización</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{courseData.title}</h3>
              <p>{courseData.description}</p>
              <p>
                <strong>Categoría: </strong>
                {courseData.category}
              </p>
              <p>
              <strong>Fechas: </strong>
              <span className="text-green-500 font-semibold">(Inicio) {new Date(courseData.startDate).toLocaleDateString()}</span>
              <span className="mx-1">-</span>
              <span className="text-red-500 font-semibold">(Fin) {new Date(courseData.endDate).toLocaleDateString()}</span>
            </p>
            </div>
  
            {/* Secciones con Material Adicional */}
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Secciones</h3>
              {sections.map((section) => (
                <div key={section.id} className="bg-gray-100 p-4 rounded-md shadow-sm mb-4">
                  <h4 className="text-lg font-semibold">{section.name}</h4>
                  <p>{section.description}</p>
  
                  {/* Mostrar el enlace de material adicional si existe */}
                  {section.videoLink && (
                    <div className="mt-2">
                      <p className="text-gray-700 font-semibold">Material adicional:</p>
                      <a
                        href={section.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {section.videoLink}
                      </a>
  
                      {/* Miniatura del video si es un enlace de YouTube */}
                      {section.videoLink.includes("youtube.com") ||
                      section.videoLink.includes("youtu.be") ? (
                        <div className="mt-2">
                          <img
                            src={`https://img.youtube.com/vi/${getYouTubeID(section.videoLink)}/hqdefault.jpg`}
                            alt="Miniatura del video"
                            className="w-64 h-36 rounded-md shadow-md"
                          />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
  
}

export default EditCourse;
