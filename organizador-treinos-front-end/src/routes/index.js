import { Fragment } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Home from "../pages/Home";
import Account from "../pages/Account";
import MyWorkouts from "../pages/MyWorkouts";
import NewWorkout from "../pages/NewWorkout";
import WorkoutDetail from "../pages/WorkoutDetail";
import Signin from "../pages/Signin";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const Private = ({ Item }) => {
  const { signed, loading } = useAuth();

  if (loading) return null;
  return signed ? <Item /> : <Signin />;
};

const RoutesApp = () => {
  return (
    <BrowserRouter>
      <Fragment>
        <Routes>
          <Route exact path="/home" element={<Private Item={Home} />} />
          <Route exact path="/account" element={<Private Item={Account} />} />
          <Route exact path="/myworkouts" element={<Private Item={MyWorkouts} />} />
          <Route exact path="/newworkout" element={<Private Item={NewWorkout} />} />
          <Route exact path="/workout/:id" element={<Private Item={WorkoutDetail} />} />
          <Route path="/" element={<Signin />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/forgot-password" element={<ForgotPassword />} />
          <Route exact path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Signin />} />
        </Routes>
      </Fragment>
    </BrowserRouter>
  );
};

export default RoutesApp;
