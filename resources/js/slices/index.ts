import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

//Mailbox
import MailboxReducer from "./mailbox/reducer";

//  Dashboard Ecommerce
import DashboardEcommerceReducer from "./dashboardEcommerce/reducer";

const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Mailbox: MailboxReducer,
    DashboardEcommerce: DashboardEcommerceReducer,
});

export default rootReducer;
