import { createBrowserRouter } from "react-router-dom";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/superadmin/Dashboard";
import Doctors from "../pages/superadmin/Doctors";
import Hospitals from "../pages/superadmin/Hospitals";
import TeamsAndConditions from "../pages/superadmin/TeamsAndConditions";
import Patients from "../pages/superadmin/Patients";
import PatientDetail from "../pages/superadmin/PatientDetail";
import PatientEdit from "../pages/superadmin/PatientEdit";
import Appointments from "../pages/superadmin/Appointments";
import Packages from "../pages/superadmin/Packages";
import EmailTemplates from "../pages/superadmin/EmailTemplates";
import Coordinators from "../pages/superadmin/Coordinators";
import Reports from "../pages/superadmin/Reports";
import Settings from "../pages/superadmin/Settings";
import Profile from "../pages/superadmin/Profile";
import HospitalApproval from "../pages/superadmin/HospitalApproval";
import RoleManagement from "../pages/superadmin/RoleManagement";
import TeamRegister from "../pages/superadmin/TeamRegister";
import LogHistoryPage from "../pages/superadmin/LogHistoryPage";

const routerData = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/",
        element: <SuperAdminLayout />,
        children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "hospitals", element: <Hospitals /> },
            { path: "hospitals/:id/approve", element: <HospitalApproval /> },
            { path: "teams-conditions", element: <TeamsAndConditions /> },
            { path: "doctors", element: <Doctors /> },
            { path: "patients", element: <Patients /> },
            { path: "patients/:id", element: <PatientDetail /> },
            { path: "patients/edit/:id", element: <PatientEdit /> },
            { path: "appointments", element: <Appointments /> },
            { path: "packages", element: <Packages /> },
            { path: "email-templates", element: <EmailTemplates /> },
            { path: "coordinators", element: <Coordinators /> },
            { path: "role-management", element: <RoleManagement /> },
            { path: "team-register", element: <TeamRegister /> },
            { path: "reports", element: <Reports /> },
            { path: "settings", element: <Settings /> },
            { path: "profile", element: <Profile /> },
            { path: "log-history", element: <LogHistoryPage /> }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])

export default routerData;
