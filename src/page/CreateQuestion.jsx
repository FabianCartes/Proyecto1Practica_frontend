import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import AuthContext from "../context/AuthContext";

function CreateQuestion() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { sectionId } = useParams(); // Obtener el ID de la sección de la URL
  const [sectionData, setSectionData] = useState({ 
    name: "", 
    description: "",
    videoLink: "",
    totalTime: null 
  });
  const [questions, setQuestions] = useState([]); // Guardar las preguntas creadas
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);  // Estado para controlar la visibilidad del modal
  const [questionType, setQuestionType] = useState("");  // Para elegir el tipo de pregunta
  const [questionText, setQuestionText] = useState("");  // Texto de la pregunta
  const [options, setOptions] = useState([{ text: "", isCorrect: false }]);  // Alternativas
  const [score, setScore] = useState(0);  // Puntaje de la pregunta
  const [editingQuestionId, setEditingQuestionId] = useState(null); // ID de la pregunta que se está editando
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [newTotalTime, setNewTotalTime] = useState(sectionData.totalTime || "");
  const [correctAnswer, setCorrectAnswer] = useState(""); // Estado para almacenar la respuesta correcta
  const [showImageModal, setShowImageModal] = useState(false); // Controlar la visibilidad del modal
  const [imageFile, setImageFile] = useState(null); // Almacenar el archivo de imagen seleccionado
  const [imageUrl, setImageUrl] = useState(""); // Agregar esta línea

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

  const fetchSectionData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/section/GetSection/${sectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos de la sección");
      }

      const data = await response.json();
      setSectionData({
        name: data.name || "",
        description: data.description || "",
        videoLink: data.videoLink || "",
        totalTime: data.totalTime || null
      });

      // Cargar las preguntas de la sección
      const questionsResponse = await fetch(`http://localhost:4000/question/GetQuestionBySection/${sectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!questionsResponse.ok) {
        throw new Error("Error al obtener las preguntas");
      }

      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.map(question => ({
        ...question,
        options: question.options || [], // Asegúrate de que las opciones estén incluidas
      })));

      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar los datos de la sección:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData();
  }, [sectionId]);

  const handleAddQuestion = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestionId(null);  // Limpiar el ID de la pregunta al cerrar el modal
    setQuestionType("");
    setQuestionText("");
    setOptions([{ text: "", isCorrect: false }]);
    setScore(0);  // Resetear puntaje al cerrar el modal
  };

  const handleQuestionTypeChange = (e) => {
    setQuestionType(e.target.value);
  };

  const handleOptionChange = (index, e) => {
    const newOptions = [...options];
    newOptions[index].text = e.target.value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    if (questionType === "alternativa") {
      setOptions((prevOptions) => {
        const updatedOptions = prevOptions.map((opt, i) => ({
          ...opt,
          isCorrect: i === index, // Solo la opción seleccionada es correcta
        }));
  
        // Actualizar la respuesta correcta en el estado
        const correctOption = updatedOptions.find((option) => option.isCorrect);
        setCorrectAnswer(correctOption ? correctOption.text : "");
  
        return updatedOptions;
      });
    } else if (questionType === "verdadero_falso") {
      // Si es verdadero o falso, actualizar directamente la respuesta correcta
      setCorrectAnswer(index === 0 ? "Verdadero" : "Falso");
    }
  };

  const EditTrueOrFalse = (selectedOption) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        isCorrect: option.text === selectedOption, // Marcar como correcta la seleccionada
      }))
    );
  
    setCorrectAnswer(selectedOption); // Actualizar el estado de la respuesta correcta
  };
  

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleRemoveOption = async (index) => {
    const optionToRemove = options[index];
  
    // Si la opción no tiene un ID (aún no ha sido guardada en la base de datos)
    if (!optionToRemove.id) {
      // Eliminar la opción del frontend directamente
      setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
  
      Swal.fire({
        icon: 'success',
        title: 'Opción eliminada',
        text: 'La opción ha sido eliminada correctamente',
      });
      return; // No hacer ninguna solicitud al backend si no tiene ID
    }
  
    // Si la opción tiene un ID (ya está guardada en la base de datos)
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
  
    if (result.isConfirmed) {
      try {
        // Enviar la solicitud DELETE al servidor
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:4000/option/DeleteOption/${optionToRemove.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Error al eliminar la opción');
        }
  
        // Si la eliminación fue exitosa, actualizamos las opciones en el estado
        setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
  
        Swal.fire({
          icon: 'success',
          title: 'Opción eliminada',
          text: 'La opción ha sido eliminada correctamente.',
        });
      } catch (error) {
        console.error('Error al eliminar opción:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Hubo un error al eliminar la opción.',
        });
      }
    } else {
      // Si el usuario cancela la eliminación
      Swal.fire({
        icon: 'info',
        title: 'Eliminación cancelada',
        text: 'La opción no ha sido eliminada.',
      });
    }
  };
  
  

  const handleSubmitQuestion = async () => {
    if (!questionText) {
      Swal.fire("Error", "La pregunta no puede estar vacía.", "error");
      return;
    }
  
    let finalOptions = options;
  
    if (questionType === "verdadero_falso") {
      if (!correctAnswer || (correctAnswer !== "Verdadero" && correctAnswer !== "Falso")) {
        Swal.fire("Error", "Debes seleccionar una respuesta válida (Verdadero o Falso).", "error");
        return;
      }
      
  
      finalOptions = [
        { text: "Verdadero", isCorrect: correctAnswer.toLowerCase() === "verdadero" },
        { text: "Falso", isCorrect: correctAnswer.toLowerCase() === "falso" },
      ];
    }
  
    // Validacion para preguntas de tipo alternativa, al menos una opción debe ser correcta
    if (questionType === "alternativa" && !finalOptions.some(option => option.isCorrect)) {
      Swal.fire("Error", "Debes marcar al menos una opción como correcta.", "error");
      return;
    }
  
    console.log("Enviando pregunta con opciones:", finalOptions);
  
    const newQuestion = {
      sectionId,
      type: questionType,
      statement: questionText,
      score: score,
      options: finalOptions,
    };
  
    const token = localStorage.getItem("token");
    const response = await fetch(
      editingQuestionId
        ? `http://localhost:4000/question/UpdateQuestion/${editingQuestionId}`
        : "http://localhost:4000/question/CreateQuestion",
      {
        method: editingQuestionId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newQuestion),
      }
    );
  
    const responseData = await response.json();
    console.log("Response from server:", responseData);
  
    if (response.ok) {
      Swal.fire("Pregunta guardada", "La pregunta fue guardada correctamente.", "success");
      handleCloseModal();
      fetchSectionData(); // Recargar las preguntas
    } else {
      Swal.fire("Error", "Hubo un problema al guardar la pregunta.", "error");
    }
  };
  


  const handleSaveTotalTime = async () => {
    const token = localStorage.getItem("token");
  
    const response = await fetch(`http://localhost:4000/section/UpdateSection/${sectionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ totalTime: newTotalTime }),
    });
  
    if (response.ok) {
      Swal.fire("Tiempo guardado", "El tiempo total ha sido actualizado.", "success");
      setShowTimeModal(false);
      fetchSectionData(); // Recargar datos de la sección
    } else {
      Swal.fire("Error", "No se pudo actualizar el tiempo.", "error");
    }
  };
  

  const handleEditQuestion = (question) => {
  setEditingQuestionId(question.id);
  setQuestionType(question.type);
  setQuestionText(question.statement);
  setScore(question.score);

  // Establece la respuesta correcta basada en las opciones de la pregunta
  const correctOption = question.options.find(option => option.isCorrect);
  setCorrectAnswer(correctOption ? correctOption.text : "Verdadero");

  // Asegúrate de cargar las opciones correctamente
  setOptions(question.options);

  setImageUrl(question.imageUrl || ""); // Guardar la URL de la imagen existente
  setImageFile(null); // Reiniciar el archivo seleccionado en caso de haber uno previo
  setShowModal(true);
};


  const handleDeleteQuestion = async (questionId) => {
    const token = localStorage.getItem("token");

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const response = await fetch(`http://localhost:4000/question/DeleteQuestion/${questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Swal.fire("Pregunta eliminada", "La pregunta fue eliminada correctamente.", "success");
        fetchSectionData(); // Recargar las preguntas después de eliminar
      } else {
        Swal.fire("Error", "Hubo un problema al eliminar la pregunta.", "error");
      }
    }
  };


  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]); // Actualiza el archivo de imagen seleccionado
  };
  
  const handleUploadImage = async () => {
    if (!imageFile) {
      Swal.fire("Error", "Por favor, selecciona una imagen.", "error");
      return;
    }
  
    if (!editingQuestionId) {
      Swal.fire("Error", "No se encontró el ID de la pregunta.", "error");
      return;
    }
  
    const formData = new FormData();
    formData.append("image", imageFile);
  
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:4000/question/UpdateQuestion/${editingQuestionId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  
    if (response.ok) {
      Swal.fire("Éxito", "Imagen subida correctamente.", "success");
      setShowImageModal(false);
      fetchSectionData(); // Recargar los datos
    } else {
      Swal.fire("Error", "Hubo un problema al subir la imagen.", "error");
    }
  };

  const handleRemoveImage = async (questionId) => {
    try {
      if (!questionId || isNaN(questionId)) {
        console.error("Invalid Question ID:", questionId);
        return;
      }
  
      const response = await fetch(`http://localhost:4000/question/RemoveImage/${questionId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Error al eliminar la imagen");
      }
  
      setImageUrl(""); // Borra la URL de la imagen en la UI
      setImageFile(null); // Borra el archivo seleccionado
    } catch (error) {
      console.error("Error eliminando la imagen:", error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-700">Crear Pregunta</h1>
          <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
            >
              Cerrar Sesión
            </button>
        </div>
      </header>

      <main className="px-4 py-10 space-y-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold shadow-lg"
          >
            Volver Atrás
          </button>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto space-y-8">
          {isLoading ? (
            <p>Cargando información de la sección...</p>
          ) : (
            <>
              <div className="w-full">
                <h2 className="text-4xl font-bold text-gray-700 mb-4">{sectionData.name}</h2>
                <p className="text-lg text-gray-600 mb-6">{sectionData.description}</p>

                {sectionData.videoLink && (
                  <div className="mb-6 flex flex-col items-center">
                    <a
                      href={sectionData.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${new URL(sectionData.videoLink).searchParams.get("v")}/hqdefault.jpg`}
                        alt="Miniatura del video"
                        className="w-full max-w-md mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-gray-700 font-semibold mt-2">Haz click para ver el video</p>
                    </a>
                  </div>
                )}

                <button
                  onClick={handleAddQuestion}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg mt-4"
                >
                  Añadir Pregunta
                </button>

                {/* Contenedor con flex para alinear el texto y el botón en una misma línea */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => setShowTimeModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg"
                  >
                    {sectionData.totalTime ? "Editar Tiempo" : "Añadir Tiempo"}
                  </button>

                  <p className="text-gray-700 text-lg font-semibold">
                    Tiempo de la sección: {sectionData.totalTime ? `${sectionData.totalTime} min` : "No asignado"}
                  </p>
                </div>



              </div>
            </>
          )}

          {/* Lista de preguntas creadas */}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold">Preguntas creadas</h3>
            {questions.length === 0 ? (
              <p>No se han creado preguntas todavía.</p>
            ) : (
              <ul>
                {questions.map((question, index) => (
                    <li key={index} className="bg-gray-100 p-4 rounded-lg mt-4">
                      <p className="font-semibold">Pregunta {index + 1}) {question.statement}</p>
                      <p className="text-gray-600">Tipo: {question.type}</p>
                      <p className="text-gray-600">Puntaje: {question.score}</p>

                      {question.imageUrl && (
                        <img
                          src={`http://localhost:4000${question.imageUrl}`}
                          alt="Pregunta"
                          className="mt-2 w-full max-h-80 object-contain" // Ajusté max-h-80 para que la imagen sea más grande
                        />
                      )}


                      {/* Mostrar opciones con letras a), b), c), etc. */}
                      {question.options.length > 0 && (
                        <div className="mt-2">
                          <h4 className="font-semibold text-gray-700">Opciones:</h4>
                          <ul>
                            {question.options.map((option, optionIndex) => (
                              <li key={optionIndex} className="text-gray-600">
                                {String.fromCharCode(97 + optionIndex)}) {option.text} {option.isCorrect && <span className="text-green-500">(Correcta)</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Botones de editar y eliminar */}
                        <div className="mt-4 flex justify-between">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                          >
                            Eliminar
                          </button>
                        </div>
                    </li>
                  ))}

              </ul>
            )}
          </div>
        </section>
      </main>

                          {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-y-auto">
                          <h2 className="text-2xl font-semibold mb-4">
                            {editingQuestionId ? "Editar Pregunta" : "Añadir Pregunta"}
                          </h2>

                          {/* Tipo de Pregunta */}
                          <label className="block text-gray-700 font-semibold mb-2">Tipo de pregunta:</label>
                          <select 
                            onChange={handleQuestionTypeChange} 
                            value={questionType} 
                            className="mb-4 p-2 border rounded-md w-full"
                          >
                            <option value="">Selecciona el tipo de pregunta</option>
                            <option value="alternativa">Alternativa</option>
                            <option value="verdadero_falso">Verdadero/Falso</option>
                          </select>

                          {/* Campos de pregunta */}
                          <input
                            type="text"
                            placeholder="Pregunta"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="mb-4 p-2 border rounded-md w-full"
                          />

                          {/* Opciones si es de tipo alternativa */}
                          {questionType === "alternativa" && (
                            <>
                              {options.map((option, index) => (
                                <div key={index} className="mb-2 flex items-center">
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(index, e)}
                                    placeholder={`Opción ${index + 1}`}
                                    className="p-2 border rounded-md w-full mr-2"
                                  />
                                  <input
                                    type="radio"
                                    checked={option.isCorrect}
                                    onChange={() => handleCorrectOptionChange(index)}
                                    className="mr-2"
                                  />
                                  Correcta

                                  <button
                                    onClick={() => handleRemoveOption(index)}
                                    className="ml-2 bg-red-300 hover:bg-red-400 text-white px-2 py-1 rounded-md"
                                  >
                                    ❌
                                  </button>
                                </div>
                              ))}
                              <button 
                                onClick={handleAddOption} 
                                className="bg-blue-500 text-white px-3 py-2 rounded-md mb-6"
                              >
                                Agregar Opción
                              </button>
                            </>
                          )}

                          {/* Opciones si es de tipo Verdadero/Falso */}
                            {questionType === "verdadero_falso" && (
                              <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Selecciona la respuesta correcta:</label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="verdaderoFalso"
                                      value="Verdadero"
                                      checked={correctAnswer === "Verdadero"}
                                      onChange={(e) => setCorrectAnswer(e.target.value)}
                                      className="cursor-pointer"
                                    />
                                    Verdadero
                                  </label>

                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="verdaderoFalso"
                                      value="Falso"
                                      checked={correctAnswer === "Falso"}
                                      onChange={(e) => setCorrectAnswer(e.target.value)}
                                      className="cursor-pointer"
                                    />
                                    Falso
                                  </label>
                                </div>
                              </div>
                            )}

                          {/* Puntaje */}
                          <label className="block text-gray-700 font-semibold mb-2">Puntaje:</label>
                          <input
                            type="number"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            placeholder="Puntaje"
                            className="mb-4 p-2 border rounded-md w-full"
                          />

                          {/* Campo para subir la imagen */}
                          <label className="block text-gray-700 font-semibold mb-2">Imagen (Opcional):</label>
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange} // Función que maneja la imagen
                              className="p-2 border rounded-md w-full"
                            />

                            {/* Mostrar el nombre de la imagen si ya hay una */}
                            {imageUrl && !imageFile && (
                              <span className="text-gray-600">{imageUrl.split('/').pop()}</span>
                            )}

                            {/* Botón para eliminar la imagen existente */}
                            {(imageFile || imageUrl) && (
                              <button
                                onClick={() => handleRemoveImage(editingQuestionId)} // Pasa el ID aquí
                                className="bg-red-300 text-white px-3 py-2 rounded-md hover:bg-red-400"
                              >
                                ❌
                              </button>
                            )}

                          </div>

                          {/* Botón para subir la imagen */}
                          {imageFile && (
                            <button
                              onClick={handleUploadImage} // Función que sube la imagen
                              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                              Añadir Imagen
                            </button>
                          )}

                          <div className="flex justify-between mt-4">
                            <button
                              onClick={handleCloseModal}
                              className="bg-red-500 text-white px-4 py-2 rounded-md "
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSubmitQuestion} // Llama a la función para guardar la pregunta
                              className="bg-green-500 text-white px-4 py-2 rounded-md"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}




            {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="text-2xl font-semibold mb-4">Configurar Tiempo Total (en minutos)</h2>
            <input
              type="number"
              value={newTotalTime}
              onChange={(e) => setNewTotalTime(Number(e.target.value))}
              placeholder="Tiempo en minutos"
              className="mb-4 p-2 border rounded-md w-full"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowTimeModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTotalTime}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CreateQuestion;
