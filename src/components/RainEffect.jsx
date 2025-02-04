import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const RainEffect = () => {
  const particlesInit = async (engine) => {
    console.log("Particles cargado", engine);
    await loadSlim(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: "#CFE2F3" }, // Azul pastel claro
        particles: {
          number: { value: 200 },
          move: { 
            enable: true,
            direction: "bottom",
            speed: 0.5,
            straight: false,
            random: false,
          },
          shape: { type: "circle" },
          size: { value: { min: 2, max: 4 } },
          opacity: { value: 0.8 }, // Un poco más transparente para suavidad
          color: { value: "#7A9EB1" }, // Azul pastel ligeramente más oscuro
          stroke: { width: 1, color: "#5D8192" }, // Un borde sutil para mejor visibilidad
        }
      }}
      
  
    />
  );
};

export default RainEffect;
