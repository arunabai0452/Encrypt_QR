import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Input, Form } from "@heroui/react";
import { handleSignIn } from "../../lib/authHandlers";
import { fetchUserInfo } from "../../services/api/apiService";
import { returnErrorMessage } from "../../utils/returnErrorMessage";
import { useAmbassadorStore } from "../../stores/useAmbassadorStore";
import "./Login.css"; // Import your custom CSS file

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Can't be empty!" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Can't be empty!" })
    .max(32, { message: "Must be 32 or fewer characters" }),
});

export default function Login() {
  const [serverError, setServerError] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const data = queryParams.get("data");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAmbassadorStore();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (values) => {
      setLoading(true);
      setServerError(null);
      try {
        const response = await handleSignIn(values, data);
        const user = await fetchUserInfo();
        setUser(user.data.user.email);
        navigate("/dashboard", { state: { decrypted_text: response.decrypted_data } });
      } catch (error) {
        setServerError(returnErrorMessage(error));
        setLoading(false);
      }
    },
    [navigate, setUser]
  );

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        {serverError && <p className="server-error">{serverError}</p>}
        <Form className="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="input"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="error-message">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="input-group">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="input"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="error-message">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" isLoading={loading} className="login-button">
            Login
          </Button>
        </Form>
      </div>
    </div>
  );
}
