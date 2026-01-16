
import Forgot from "../../screens/Authentication/Forgot";
import Login from "../../screens/Authentication/Login";
import Signup from "../../screens/Authentication/Signup";
import AddAmount from "../../screens/Expenses/AddAmount";
import Groups from "../../screens/Group/Groups";
import GroupDetails from "../../screens/Group/GroupDetails";
import Account from "../../screens/UserAccount/Account";
import Notifications from "../../screens/UserAccount/Notifications";
import BottomTab from "../../navigation/BottomTab";
import  {AuthenticationStack}  from "../../navigation/index";
import  {GroupsStack} from "../../navigation/index";
import { AccountStack } from "../../navigation/index";
import RootNavigator from "../../navigation/RootNavigator";
import Home from "../../screens/Home/Home";


export const Screens = {
  LOGIN_SCREEN: Login,
  SIGNUP_SCREEN: Signup,
  ACCOUNT_SCREEN: Account,
  NOTIFICATIONS_SCREEN: Notifications,
  FORGOT_SCREEN: Forgot,
  HOME_SCREEN: Home,
  ADD_AMOUNT_SCREEN: AddAmount,
  BOTTOM_TABS: BottomTab,
  AUTHENTICATION_STACK: AuthenticationStack,
  GROUPS_STACK: GroupsStack,
  ACCOUNT_STACK: AccountStack,
  ROOT_NAVIGATOR: RootNavigator,
  GROUPS_SCREEN: Groups,
  GROUP_DETAILS: GroupDetails,
};
