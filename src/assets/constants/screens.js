
import Forgot from "../../screens/Authentication/Forgot";
import Login from "../../screens/Authentication/Login";
import Signup from "../../screens/Authentication/Signup";
import AddAmount from "../../screens/Expenses/AddAmount";
import Groups from "../../screens/Group/Groups";
import GroupDetails from "../../screens/Group/GroupDetails";
import Account from "../../screens/UserAccount/Account";
import BottomTab from "../../navigation/BottomTab";
import  {AuthenticationStack}  from "../../navigation/index";
import  {GroupsStack} from "../../navigation/index";
import RootNavigator from "../../navigation/RootNavigator";
import Home from "../../screens/Home/Home";
import SplitGroupExpense from "../../screens/Group/SplitGroupExpenseModal";


export const Screens = {
  LOGIN_SCREEN: Login,
  SIGNUP_SCREEN: Signup,
  ACCOUNT_SCREEN: Account,
  FORGOT_SCREEN: Forgot,
  HOME_SCREEN: Home,
  ADD_AMOUNT_SCREEN: AddAmount,
  BOTTOM_TABS: BottomTab,
  AUTHENTICATION_STACK: AuthenticationStack,
  GROUPS_STACK: GroupsStack,
  ROOT_NAVIGATOR: RootNavigator,
  GROUPS_SCREEN: Groups,
  GROUP_DETAILS: GroupDetails,
  SPLIT_GROUP_EXPENSE: SplitGroupExpense
};
