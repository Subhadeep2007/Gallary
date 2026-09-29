import axios from "axios";


// ========================================
// API BASE URL
// ========================================

const configuredApiUrl = import.meta.env.VITE_API_URL;
const runningOnLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const pointsToLocalhost = Boolean(
    configuredApiUrl &&
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(configuredApiUrl)
);

// A localhost API URL baked into a production build points each visitor back
// at their own device. Use same-origin /api in that case.
const API_URL = pointsToLocalhost && !runningOnLocalhost
    ? "/api"
    : configuredApiUrl || "/api";


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

        // Axios serializes FormData as JSON when the instance's default
        // application/json header is present. Let the browser set the
        // multipart boundary so Multer receives the binary file correctly.
        if (
            typeof FormData !== "undefined" &&
            config.data instanceof FormData
        ) {

            config.headers.delete("Content-Type");

        }

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
