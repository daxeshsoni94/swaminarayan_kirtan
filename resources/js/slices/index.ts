import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

//Mailbox
import MailboxReducer from "./mailbox/reducer";

//  Dashboard Ecommerce
import DashboardKirtanReducer from "./dashboardKirtan/reducer";

const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Mailbox: MailboxReducer,
    DashboardKirtan: DashboardKirtanReducer,
});

export default rootReducer;
