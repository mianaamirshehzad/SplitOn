import Login from "../../screens/Login";
import Signup from "../../screens/Signup";
import Account from "../../screens/Account";
import Forgot from "../../screens/Forgot";
import Home from "../../screens/AddAmount";
import AddAmount from "../../screens/AddAmount";
import BottomTabs from "../../navigation/BottomTab";
import AuthenticationStack from "../../navigation";

export const Screens = {
  LOGIN_SCREEN: Login,
  SIGNUP_SCREEN: Signup,
  ACCOUNT_SCREEN: Account,
  FORGOT_SCREEN: Forgot,
  HOME_SCREEN: Home,
  ADD_AMOUNT_SCREEN: AddAmount,
  BOTTOM_TABS: BottomTabs,
  MY_STACK: AuthenticationStack,
};
