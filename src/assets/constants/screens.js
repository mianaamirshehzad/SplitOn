import Login from "../../screens/Login";
import Signup from "../../screens/Signup";
import Account from "../../screens/Account";
import Forgot from "../../screens/Forgot";
import AddAmount from "../../screens/AddAmount";
import BottomTab from "../../navigation/BottomTab";
import AuthenticationStack from "../../navigation";
import RootNavigator from "../../navigation/RootNavigator";
import Home from "../../screens/Home";

export const Screens = {
  LOGIN_SCREEN: Login,
  SIGNUP_SCREEN: Signup,
  ACCOUNT_SCREEN: Account,
  FORGOT_SCREEN: Forgot,
  HOME_SCREEN: Home,
  ADD_AMOUNT_SCREEN: AddAmount,
  BOTTOM_TABS: BottomTab,
  AUTHENTICATION_STACK: AuthenticationStack,
  ROOT_NAVIGATOR: RootNavigator,
  HOME_SCREEN: Home,
};
