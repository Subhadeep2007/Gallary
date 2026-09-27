import axios from "axios";


// ========================================
// API BASE URL
// ========================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";


// ========================================
// AXIOS INSTANCE
// ========================================

const api =
    axios.create({

        baseURL: API_URL,

        withCredentials: true,

        headers: {

            "Content-Type": "application/json"

        }

    });


// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(

    (config) => {

        const accessToken =
            localStorage.getItem(
                "accessToken"
            );


        if (accessToken) {

            config.headers.Authorization =
                `Bearer ${accessToken}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(
            error
        );

    }

);


// ========================================
// RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    async (error) => {
        const request = error.config;
        const hasAccessToken = Boolean(request?.headers?.Authorization);
        const isRefreshRequest = request?.url?.includes("/auth/refresh-token");

        if (
            error.response?.status !== 401 ||
            !request ||
            request._authRetry ||
            !hasAccessToken ||
            isRefreshRequest
        ) {
            return Promise.reject(error);
        }

        request._authRetry = true;

        try {
            const refreshResponse = await axios.post(
                `${API_URL}/auth/refresh-token`,
                {},
                { withCredentials: true }
            );
            const session = refreshResponse.data?.data;

            if (!session?.accessToken || !session?.user) {
                throw new Error("Invalid refresh response");
            }

            localStorage.setItem("accessToken", session.accessToken);
            localStorage.setItem("currentUser", JSON.stringify(session.user));
            request.headers.Authorization = `Bearer ${session.accessToken}`;

            return api(request);
        } catch (refreshError) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("currentUser");
            window.dispatchEvent(new Event("auth:session-expired"));
            return Promise.reject(refreshError);
        }

    }

);


export default api;
