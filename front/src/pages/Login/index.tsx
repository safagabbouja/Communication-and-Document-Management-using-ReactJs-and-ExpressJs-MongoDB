import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DarkModeSwitcher from "../../components/DarkModeSwitcher";
import MainColorSwitcher from "../../components/MainColorSwitcher";
import { FormInput, FormCheck } from "../../base-components/Form";
import Button from "../../base-components/Button";
import clsx from "clsx";
import logoUrl from "../../assets/images/logo.svg";
import illustrationUrl from "../../assets/images/illustration.svg";

function Main() {
  const [data, setData] = useState({
    email: "",
    password: "",
    role: "customer",
  });
  const { email, password } = data;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      Swal.fire({
        title: "Please fill all the fields",
        icon: "warning",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data: responseData } = await axios.post(
        "http://localhost:5000/api/user/login",
        { email, password },
        config
      );

      Swal.fire({
        title: "Login Successful",
        icon: "success",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(responseData));
      setLoading(false);

      if (responseData.role === "admin") {
        navigate("/crud-data-list");
      } else {
        navigate("/chat");
      }
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        icon: "error",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <div
      className={clsx([
        "-m-3 sm:-mx-8 p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
        "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
        "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
      ])}
    >
      <DarkModeSwitcher />
      <MainColorSwitcher />
      <div className="container relative z-10 sm:px-10">
        <div className="block grid-cols-2 gap-4 xl:grid">
          <div className="flex-col hidden min-h-screen xl:flex">
            <a href="#" className="flex items-center pt-5 -intro-x">
              <img alt="Logo" className="w-6" src={logoUrl} />
              <span className="ml-3 text-lg text-white">REGISTRATION</span>
            </a>
            <div className="my-auto">
              <img
                alt="Illustration"
                className="w-1/2 -mt-16 -intro-x"
                src={illustrationUrl}
              />
              <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                A few more clicks to <br />
                sign in to your account.
              </div>
              <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                Manage all your e-commerce accounts in one place
              </div>
            </div>
          </div>
          <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
            <div className="w-full px-5 py-8 mx-auto my-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 xl:p-0 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
              <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                Sign In
              </h2>
              <div className="mt-2 text-center intro-x text-slate-400 dark:text-slate-400 xl:hidden">
                A few more clicks to sign in to your account. Manage all your
                e-commerce accounts in one place
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mt-8 intro-x">
                  <FormInput
                    type="text"
                    name="email"
                    className="block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px]"
                    placeholder="Email"
                    required
                    onChange={handleInputChange}
                  />
                  <FormInput
                    type="password"
                    name="password"
                    className="block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px]"
                    placeholder="Password"
                    required
                    onChange={handleInputChange}
                  />
                  <select
                    name="role"
                    className="block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px] border rounded-md"
                    onChange={handleInputChange}
                    value={data.role}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center mt-4 text-xs intro-x text-slate-600 dark:text-slate-500 sm:text-sm">
                  <FormCheck.Input
                    id="remember-me"
                    type="checkbox"
                    className="mr-2 border"
                  />
                  <label
                    className="cursor-pointer select-none"
                    htmlFor="remember-me"
                  >
                    I agree to the Envato
                  </label>
                  <a
                    className="ml-1 text-primary dark:text-slate-200"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  .
                </div>
                <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left">
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full px-4 py-3 align-top xl:w-32 xl:mr-3"
                  >
                    Register
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
