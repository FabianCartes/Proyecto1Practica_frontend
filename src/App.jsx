import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './page/Login';
import Register from './page/Register';
import Home from './page/Home';
import PrivateRoute from './components/PrivateRoute';
import HomeMod from './page/HomeMod';
import CreateCourse from './page/CreateCourse';
import EditCourse from './page/EditCourse';
import CreateQuestion from './page/CreateQuestion';
import Course from './page/Course';
import QuestionPage from './page/Question';
import Congratulation from './page/Congratulation';
import Results from './page/Results';

function App() {
  return (
      <Router>
        <AuthProvider>
          <Routes>
            {/* Ruta publica */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Ruta para el home con rol de usuario */}
            <Route 
              path="/home" 
              element={<PrivateRoute allowedRoles={['user', 'moderador']}><Home /></PrivateRoute>} 
            />
            <Route 
              path="/Course/:courseId" 
              element={<PrivateRoute allowedRoles={['user', 'moderador']}><Course /></PrivateRoute>} 
            />
            <Route 
              path="/Question/:sectionId" 
              element={<PrivateRoute allowedRoles={['user', 'moderador']}><QuestionPage /></PrivateRoute>} 
            />
            <Route 
              path="/Congratulation/:sectionId" 
              element={<PrivateRoute allowedRoles={['user', 'moderador']}><Congratulation /></PrivateRoute>} 
            />
            <Route 
              path="/Results/:sectionId" 
              element={<PrivateRoute allowedRoles={['user', 'moderador']}><Results/></PrivateRoute>} 
            />

            {/* Ruta para el homeMod con rol de moderador */}
            <Route 
              path="/homeMod" 
              element={<PrivateRoute allowedRoles={['moderador']}><HomeMod /></PrivateRoute>} 
            />
            <Route 
              path="/createCourse" 
              element={<PrivateRoute allowedRoles={['moderador']}><CreateCourse /></PrivateRoute>} 
            />
            <Route 
              path="/editCourse/:courseId" 
              element={<PrivateRoute allowedRoles={['moderador']}><EditCourse/></PrivateRoute>} 
            />
            <Route 
              path="/CreateQuestion/:sectionId" 
              element={<PrivateRoute allowedRoles={['moderador']}><CreateQuestion/></PrivateRoute>} 
            />
          </Routes>
        </AuthProvider>
      </Router>
  );
}

export default App;