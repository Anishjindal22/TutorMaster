import { Routes } from "react-router-dom";
import "./App.css";
import { Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/common/Navbar"
import OpenRoute from "./components/core/Auth/OpenRoute"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Error from "./pages/Error"
import Settings from "./components/core/Dashboard/Settings";
import { useSelector } from "react-redux";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Cart from "./components/core/Dashboard/Cart";
import { ACCOUNT_TYPE } from "./utils/constants";
import AddCourse from "./components/core/Dashboard/Add Course/index";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import Instructor from "./components/core/Dashboard/Instructor"
import UpdatePassword from "./components/core/Dashboard/Settings/UpdatePassword";
import CodePractice from "./components/core/Dashboard/CodePractice";
import Notifications from "./components/core/Dashboard/Notifications";
import SendNotification from "./components/core/Dashboard/SendNotification";
import AdminDashboard from "./components/core/Dashboard/AdminDashboard";

function App() {
  const { user } = useSelector((state) => state.profile)
 
  return (
    <div className="w-screen min-h-screen bg-surface-dark text-text-main flex flex-col font-inter selection:bg-brand-primary selection:text-white" >
      <Navbar/>
      <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="catalog/:catalogName" element={<Catalog/>} />
            <Route path="catalog/:catalogName/*" element={<Catalog/>} />
            <Route path="courses/:courseId" element={<CourseDetails/>}/>

            <Route path="forgot-password" element={<OpenRoute><ForgotPassword/></OpenRoute>}/>
            <Route path="signup" element={
              <OpenRoute>
                <Signup/>
              </OpenRoute>
            } />
            <Route path="login" element={
              <OpenRoute>
                <Login/>
              </OpenRoute>
            } />
            <Route
              path="verify-email"
              element={
                <OpenRoute>
                  <VerifyEmail />
                </OpenRoute>
              }
             />  

            <Route
              path="update-password/:id"
              element={
                <OpenRoute>
                  <UpdatePassword />
                </OpenRoute>
              }
            />  

          <Route
                path="about"
                element={
                  
                    <About />
                  
                }
          />  
          <Route
            path="contact"
            element={
              
                <ContactPage />
              
            }
          />  

          <Route 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="dashboard/my-profile" element={<MyProfile />} />
            <Route path="dashboard/settings" element={<Settings />} />
            <Route path="dashboard/notifications" element={<Notifications />} />
            

            {
              user?.accountType === ACCOUNT_TYPE.STUDENT && (
                <>
                <Route path="dashboard/cart" element={<Cart />} />
                <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
                </>
              )
            }

            {
              (user?.accountType === ACCOUNT_TYPE.STUDENT || user?.accountType === ACCOUNT_TYPE.INSTRUCTOR || user?.accountType === ACCOUNT_TYPE.ADMIN) && (
                <Route path="dashboard/code-practice" element={<CodePractice />} />
              )
            }

            {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="dashboard/instructor" element={<Instructor />} />
                <Route path="dashboard/add-course" element={<AddCourse />} />
                <Route path="dashboard/my-courses" element={<MyCourses />} />
                <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
              </>
            )}

            {(user?.accountType === ACCOUNT_TYPE.INSTRUCTOR ||
              user?.accountType === ACCOUNT_TYPE.ADMIN) && (
              <Route
                path="dashboard/send-notification"
                element={<SendNotification />}
              />
            )}

            {user?.accountType === ACCOUNT_TYPE.ADMIN && (
              <Route path="dashboard/admin" element={<AdminDashboard />} />
            )}

          </Route>

          <Route element={
            <PrivateRoute>
              <ViewCourse/>
            </PrivateRoute>
          }>

            {
              user?.accountType === ACCOUNT_TYPE.STUDENT && (
                <>
                  <Route
                    path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                    element={<VideoDetails/>}
                  />
                </>
              )
            }
          </Route>
          <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
