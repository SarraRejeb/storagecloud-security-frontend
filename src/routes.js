import Dashboard from "views/Dashboard.jsx";
import UserProfile from "views/UserProfile.js";
import TableList from "views/TableList.js";
import Notifications from "views/Notifications.js";
import Quiz from "views/Quiz.jsx";
import Result from "views/ResultPage.jsx"; 
import SecurityChatbot from "views/Chatbot.jsx";
const dashboardRoutes = [


{
  path: "/quiz",
  name: "Quiz",
  icon: "nc-icon nc-notes",
  component: Quiz,
  layout: "/admin"
},

  {
  path: "/result",
  name: "Résultat",
  icon: "nc-icon nc-chart-bar-32",
  component: Result,
  layout: "/admin"
  },
    {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
    {
    path: "/chatbot",
    name: "Assistant IA",
    icon: "fa fa-robot",
    component: SecurityChatbot,
    layout: "/admin",
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin"
  },
  {
    path: "/table",
    name: "Table List",
    icon: "nc-icon nc-notes",
    component: TableList,
    layout: "/admin"
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "nc-icon nc-bell-55",
    component: Notifications,
    layout: "/admin"
  }
];

export default dashboardRoutes;
