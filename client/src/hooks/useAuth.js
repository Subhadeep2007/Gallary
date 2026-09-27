import {
    useContext
} from "react";

import {
    AuthContext
} from "../context/AuthContext";


// ========================================
// USE AUTH
// ========================================

const useAuth = () => {

    const context =
        useContext(
            AuthContext
        );


    // ========================================
    // CHECK PROVIDER
    // ========================================

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

};


export default useAuth;