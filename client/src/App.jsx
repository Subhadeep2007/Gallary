import {
    BrowserRouter
} from "react-router-dom";

import AppRoutes
from "./routes/AppRoutes.jsx";


const App = () => {

    return (

        <BrowserRouter>

            <AppRoutes />

        </BrowserRouter>

    );

};


export default App;