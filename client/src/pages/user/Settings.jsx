import {
    KeyRound,
    RotateCcw
} from "lucide-react";

import {
    Link
} from "react-router-dom";


// ========================================
// SETTINGS PAGE
// ========================================

const Settings = () => {

    return (

        <div className="
            min-h-screen
            bg-slate-950
            px-6
            py-10
            text-white
        ">

            <div className="
                mx-auto
                max-w-3xl
            ">

                {/* ==============================
                    HEADER
                ============================== */}

                <div className="
                    mb-8
                ">

                    <p className="
                        text-sm
                        font-medium
                        text-violet-400
                    ">
                        Settings
                    </p>

                    <h1 className="
                        mt-2
                        text-3xl
                        font-bold
                    ">
                        Account Settings
                    </h1>

                    <p className="
                        mt-2
                        text-slate-400
                    ">
                        Manage your account security.
                    </p>

                </div>


                {/* ==============================
                    SECURITY
                ============================== */}

                <div className="
                    grid
                    gap-5
                    sm:grid-cols-2
                ">

                    {/* ==========================
                        CHANGE PASSWORD
                    ========================== */}

                    <Link
                        to="/change-password"
                        className="
                            group
                            rounded-2xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-6
                            transition
                            hover:border-violet-500/50
                            hover:bg-slate-900/80
                        "
                    >

                        <div className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-violet-500/10
                            text-violet-400
                        ">

                            <KeyRound
                                size={24}
                            />

                        </div>


                        <h2 className="
                            mt-5
                            text-lg
                            font-semibold
                        ">
                            Change Password
                        </h2>


                        <p className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-400
                        ">
                            Change your current account password.
                        </p>


                        <div className="
                            mt-5
                            text-sm
                            font-medium
                            text-violet-400
                            transition
                            group-hover:text-violet-300
                        ">
                            Open →
                        </div>

                    </Link>


                    {/* ==========================
                        RESET PASSWORD
                    ========================== */}

                    <Link
                        to="/forgot-password"
                        className="
                            group
                            rounded-2xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-6
                            transition
                            hover:border-violet-500/50
                            hover:bg-slate-900/80
                        "
                    >

                        <div className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-violet-500/10
                            text-violet-400
                        ">

                            <RotateCcw
                                size={24}
                            />

                        </div>


                        <h2 className="
                            mt-5
                            text-lg
                            font-semibold
                        ">
                            Reset Password
                        </h2>


                        <p className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-400
                        ">
                            Reset your password using email verification.
                        </p>


                        <div className="
                            mt-5
                            text-sm
                            font-medium
                            text-violet-400
                            transition
                            group-hover:text-violet-300
                        ">
                            Open →
                        </div>

                    </Link>

                </div>

            </div>

        </div>

    );

};

export default Settings;