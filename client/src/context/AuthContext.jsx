import {
    createContext,
    useCallback,
    useEffect,
    useState
} from "react";

import {
    loginUser as loginUserAPI,
    loginAdmin as loginAdminAPI,
    registerUser as registerUserAPI,
    registerAdmin as registerAdminAPI,
    verifyEmail as verifyEmailAPI,
    resendVerificationOTP as resendVerificationOTPAPI,
    refreshAccessToken as refreshAccessTokenAPI,
    logoutUser as logoutUserAPI,
    forgotPassword as forgotPasswordAPI,
    resetPassword as resetPasswordAPI,
    changePassword as changePasswordAPI
} from "../services/auth/auth.service";


// ========================================
// CONTEXT
// ========================================

export const AuthContext =
    createContext(null);


// ========================================
// STORAGE KEYS
// ========================================

const ACCESS_TOKEN_KEY =
    "accessToken";

const USER_KEY =
    "currentUser";


// ========================================
// AUTH PROVIDER
// ========================================

const AuthProvider = ({
    children
}) => {

    const [
        user,
        setUser
    ] = useState(() => {

        const storedUser =
            localStorage.getItem(
                USER_KEY
            );

        if (!storedUser) {
            return null;
        }

        try {

            return JSON.parse(
                storedUser
            );

        } catch (error) {

            localStorage.removeItem(
                USER_KEY
            );

            return null;

        }

    });


    const [
        accessToken,
        setAccessToken
    ] = useState(() => {

        return localStorage.getItem(
            ACCESS_TOKEN_KEY
        );

    });


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        isAuthenticated,
        setIsAuthenticated
    ] = useState(() => {

        return Boolean(
            localStorage.getItem(
                ACCESS_TOKEN_KEY
            )
        );

    });


    // ========================================
    // SAVE SESSION
    // ========================================

    const saveSession = useCallback(({
        user: userData,
        accessToken: token
    }) => {

        if (!userData || !token) {

            return;

        }


        localStorage.setItem(
            ACCESS_TOKEN_KEY,
            token
        );


        localStorage.setItem(
            USER_KEY,
            JSON.stringify(
                userData
            )
        );


        setAccessToken(
            token
        );


        setUser(
            userData
        );


        setIsAuthenticated(
            true
        );

    }, []);


    // ========================================
    // CLEAR SESSION
    // ========================================

    const clearSession = useCallback(() => {

        localStorage.removeItem(
            ACCESS_TOKEN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );


        setAccessToken(
            null
        );

        setUser(
            null
        );

        setIsAuthenticated(
            false
        );

    }, []);

    const updateUser = useCallback((userUpdates) => {
        setUser((currentUser) => {
            if (!currentUser) return currentUser;

            const updatedUser = { ...currentUser, ...userUpdates };
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);


    // ========================================
    // REFRESH SESSION
    // ========================================

    const refreshSession = useCallback(
        async () => {

            try {

                const response =
                    await refreshAccessTokenAPI();


                const session =
                    response?.data;


                if (
                    !session?.accessToken ||
                    !session?.user
                ) {

                    throw new Error(
                        "Invalid refresh response"
                    );

                }


                saveSession({

                    user:
                        session.user,

                    accessToken:
                        session.accessToken

                });


                return {

                    success:
                        true,

                    user:
                        session.user,

                    accessToken:
                        session.accessToken

                };

            } catch (error) {

                clearSession();

                return {

                    success:
                        false,

                    error

                };

            }

        },
        [
            saveSession,
            clearSession
        ]
    );


    // ========================================
    // RESTORE SESSION ON APP START
    // ========================================

    useEffect(() => {

        const restoreSession =
            async () => {

                try {

                    const storedToken =
                        localStorage.getItem(
                            ACCESS_TOKEN_KEY
                        );


                    const storedUser =
                        localStorage.getItem(
                            USER_KEY
                        );


                    // ========================================
                    // NO PREVIOUS SESSION
                    // ========================================

                    if (
                        !storedToken &&
                        !storedUser
                    ) {

                        setLoading(
                            false
                        );

                        return;

                    }


                    // ========================================
                    // RESTORE STORED USER IMMEDIATELY
                    // ========================================

                    if (storedUser) {

                        try {

                            const parsedUser =
                                JSON.parse(
                                    storedUser
                                );


                            setUser(
                                parsedUser
                            );

                        } catch (error) {

                            localStorage.removeItem(
                                USER_KEY
                            );

                        }

                    }


                    // ========================================
                    // REFRESH ACCESS TOKEN
                    // ========================================
                    //
                    // This keeps the session alive after
                    // page refresh and renews an expired
                    // access token using the HTTP-only cookie.
                    // ========================================

                    const result =
                        await refreshSession();


                    if (!result.success) {

                        clearSession();

                    }

                } finally {

                    setLoading(
                        false
                    );

                }

            };


        restoreSession();

    }, [
        refreshSession,
        clearSession
    ]);

    useEffect(() => {
        const handleSessionExpired = () => clearSession();

        window.addEventListener("auth:session-expired", handleSessionExpired);
        return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
    }, [clearSession]);


    // ========================================
    // USER LOGIN
    // ========================================

    const loginUser = useCallback(
        async ({
            email,
            password
        }) => {

            const response =
                await loginUserAPI({

                    email,

                    password

                });


            if (
                response?.data
                    ?.requiresEmailVerification
            ) {

                return response;

            }


            if (
                !response?.data
                    ?.accessToken ||
                !response?.data
                    ?.user
                ||
                response.data.user.role !== "user"
            ) {

                throw new Error(
                    "Invalid login response"
                );

            }


            saveSession({

                user:
                    response.data.user,

                accessToken:
                    response.data.accessToken

            });


            return response;

        },
        [
            saveSession
        ]
    );


    // ========================================
    // ADMIN LOGIN
    // ========================================

    const loginAdmin = useCallback(
        async ({
            email,
            password,
            adminSecretKey
        }) => {

            const response =
                await loginAdminAPI({

                    email,

                    password,

                    adminSecretKey

                });


            if (
                response?.data
                    ?.requiresEmailVerification
            ) {

                return response;

            }


            if (
                !response?.data
                    ?.accessToken ||
                !response?.data
                    ?.user
                ||
                response.data.user.role !== "admin"
            ) {

                throw new Error(
                    "Invalid admin login response"
                );

            }


            saveSession({

                user:
                    response.data.user,

                accessToken:
                    response.data.accessToken

            });


            return response;

        },
        [
            saveSession
        ]
    );


    // ========================================
    // USER REGISTER
    // ========================================

    const registerUser = useCallback(
        async (userData) => {

            return registerUserAPI(
                userData
            );

        },
        []
    );


    // ========================================
    // ADMIN REGISTER
    // ========================================

    const registerAdmin = useCallback(
        async (adminData) => {

            return registerAdminAPI(
                adminData
            );

        },
        []
    );


    // ========================================
    // VERIFY EMAIL
    // ========================================

    const verifyEmail = useCallback(
        async ({
            email,
            otp
        }) => {

            return verifyEmailAPI({

                email,

                otp

            });

        },
        []
    );


    // ========================================
    // RESEND OTP
    // ========================================

    const resendVerificationOTP =
        useCallback(
            async (email) => {

                return resendVerificationOTPAPI(
                    email
                );

            },
            []
        );


    // ========================================
    // FORGOT PASSWORD
    // ========================================

    const forgotPassword =
        useCallback(
            async (email) => {

                return forgotPasswordAPI(
                    email
                );

            },
            []
        );


    // ========================================
    // RESET PASSWORD
    // ========================================

    const resetPassword =
        useCallback(
            async ({
                email,
                otp,
                newPassword
            }) => {

                return resetPasswordAPI({

                    email,

                    otp,

                    newPassword

                });

            },
            []
        );


    // ========================================
    // CHANGE PASSWORD
    // ========================================

    const changePassword =
        useCallback(
            async ({
                currentPassword,
                newPassword
            }) => {

                return changePasswordAPI({

                    currentPassword,

                    newPassword

                });

            },
            []
        );


    // ========================================
    // LOGOUT
    // ========================================

    const logout = useCallback(
        async () => {

            try {

                await logoutUserAPI();

            } finally {

                clearSession();

            }

        },
        [
            clearSession
        ]
    );


    // ========================================
    // CONTEXT VALUE
    // ========================================

    const value = {

        user,

        updateUser,

        accessToken,

        isAuthenticated,

        loading,

        loginUser,

        loginAdmin,

        registerUser,

        registerAdmin,

        verifyEmail,

        resendVerificationOTP,

        refreshSession,

        forgotPassword,

        resetPassword,

        changePassword,

        logout

    };


    // ========================================
    // PROVIDER
    // ========================================

    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );

};


export default AuthProvider;
