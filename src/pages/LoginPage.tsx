import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/endpoints';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { userId: 'vedant-admin', password: 'vedant123' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: { userId: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.login(data.userId, data.password);
      console.log('Login response:', res.data);
      if (res.data.status === 'success') {
        const { token, user } = res.data.data;
        login(token, user);
        navigate('/');
      } else {
        console.log('Login failed. Please check your credentials.', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      console.log(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-stretch">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-[#f5f7fa]">
        <div className="w-full max-w-sm">
          <img
            src="../login.svg"
            alt="Login Illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md flex flex-col items-start gap-[30px] text-left">
          <img
            src="../preproute.svg"
            alt="Company Logo"
            className="w-[134px] h-[33px]"
          />
          <div className="flex flex-col gap-[20px] w-full">
            <h2 className="text-[30px] font-semibold text-[#374151]">Login</h2>
            <p className="text-sm text-[#64748b]">
              Use your company provided Login credentials
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-[30px]"
          >
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-medium text-[#1e293b]">
                User ID
              </label>
              <input
                type="text"
                placeholder="Enter User ID"
                {...register("userId", {required: "User ID is required"})}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-sm text-[#0f172a] placeholder-[#cbd5e0] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition"
              />
              {errors.userId && (
                <p className="text-xs text-red-500">{errors.userId.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-medium text-[#1e293b]">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                {...register("password", {required: "Password is required"})}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-sm text-[#0f172a] placeholder-[#cbd5e0] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="w-full flex">
              <button
                type="button"
                className="text-sm font-medium text-[#1B5DEF] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full rounded-lg bg-[#1B5DEF] cursor-pointer py-3 text-base font-semibold text-white transition hover:bg-[#4338ca] disabled:opacity-75"
            >
              {isSubmitting || loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
