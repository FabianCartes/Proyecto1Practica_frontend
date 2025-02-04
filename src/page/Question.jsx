import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AuthContext from "../context/AuthContext";

function Question() {
  const { user } = useContext(AuthContext);
  const { sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navigate = useNavigate();

  // Recuperar preguntas
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/question/GetQuestionBySection/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar las preguntas:", error);
      setQuestions([]);
    }
  };

  // Recuperar datos de la sección y tiempo
  const fetchSection = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/section/GetSection/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al obtener la sección");

      const data = await response.json();
      setSection(data);

      if (data && data.totalTime) {
        const savedTime = localStorage.getItem(`timeRemaining-${sectionId}`);
        setTimeRemaining(savedTime ? parseInt(savedTime, 10) : data.totalTime * 60);
      }
    } catch (error) {
      console.error("Error al cargar la sección:", error);
    }
  };

  // Manejar el temporizador
  useEffect(() => {
    if (timeRemaining === null) return;
  
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          localStorage.removeItem(`timeRemaining-${sectionId}`);
  
          Swal.fire({
            title: "¡Tiempo agotado!",
            text: "El tiempo se ha agotado. Se enviarán tus respuestas automáticamente.",
            icon: "warning",
            confirmButtonText: "Aceptar",
          }).then(() => {
            enviarRespuestas(); // Llamar directamente a enviarRespuestas()
            navigate(`/Congratulation/${sectionId}`);
          });
  
          return 0;
        }
        localStorage.setItem(`timeRemaining-${sectionId}`, prevTime - 1);
        return prevTime - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [timeRemaining, sectionId]);
  

  useEffect(() => {
    fetchQuestions();
    fetchSection();
  }, [sectionId]);

  // Manejar selección de opción
  const handleOptionSelect = (questionId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Enviar respuestas
  const handleSubmitAnswers = async () => {
    Swal.fire({
      title: "¿Estás seguro de enviar las respuestas?",
      text: "Asegúrate de haber revisado todas tus respuestas antes de enviar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Volver a revisar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        enviarRespuestas();
      }
    });
  };
  
  // Enviar respuestas y limpiar el temporizador
  const enviarRespuestas = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!user || !user.id) {
        console.error("Usuario no identificado.");
        return;
      }
  
      const answers = Object.entries(selectedOptions).map(([questionId, optionId]) => ({
        userId: user.id,
        questionId: parseInt(questionId),
        optionId: optionId,
      }));
  
      const response = await fetch("http://localhost:4000/user_answer/SaveUserAnswer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
  
      if (response.ok) {
        // Limpiar temporizador y redirigir
        localStorage.removeItem(`timeRemaining-${sectionId}`);
        setTimeRemaining(null);
        navigate(`/Congratulation/${sectionId}`);
      } else {
        Swal.fire({
          title: "Error",
          text: "Hubo un error al enviar las respuestas.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      console.error("Error al enviar respuestas:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un error al enviar las respuestas.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };
  
  // Detener temporizador al enviar respuestas
  useEffect(() => {
    if (timeRemaining === 0) {
      localStorage.removeItem(`timeRemaining-${sectionId}`);
      navigate(`/Congratulation/${sectionId}`);
    }
  }, [timeRemaining, navigate, sectionId]);
  
  
  

  // Convertir segundos a formato de minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 text-gray-800">
      <header className="bg-white shadow-md p-4 text-center flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-700 flex-1 text-center">{section?.name || "Cargando..."}</h1>
        {timeRemaining !== null && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white text-lg font-semibold px-4 py-2 rounded-full shadow-lg">
          ⏳ {formatTime(timeRemaining)}
        </div>
      )}

      </header>

      <main className="px-6 py-10 max-w-4xl mx-auto">
        {questions.length > 0 ? (
          <ul className="space-y-6">
            {questions.map((question, index) => (
              <li key={question.id} className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                <h3 className="text-xl font-bold text-gray-700">{`${index + 1}) ${question.statement}`}</h3>

                {question.imageUrl && (
                  <img
                    src={`http://localhost:4000${question.imageUrl}`}
                    alt="Pregunta"
                    className="mt-2 rounded-lg w-full max-w-md mx-auto"
                  />
                )}
                {question.videoUrl && (
                  <video controls className="mt-2 w-full rounded-lg">
                    <source src={question.videoUrl} type="video/mp4" />
                    Tu navegador no soporta el video.
                  </video>
                )}

                <ul className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <li key={option.id} className="p-2 bg-gray-100 rounded-md cursor-pointer transition duration-300"
                        onClick={() => handleOptionSelect(question.id, option.id)}
                        style={{
                          backgroundColor: selectedOptions[question.id] === option.id ? "lightblue" : "",
                        }}>
                      {`${String.fromCharCode(97 + optionIndex)}) ${option.text}`} 
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center">No hay preguntas disponibles.</p>
        )}

        {questions.length > 0 && (
          <div className="text-center mt-6">
            <button 
              onClick={handleSubmitAnswers}
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            >
              Enviar respuestas
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Question;
