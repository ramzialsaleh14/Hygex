import { Dimensions, Platform } from "react-native";
// colors
export const appColor = "#009BC9";
export const darkBlueColor = "#386280";
export const greenColor = "#6BA561";
export const width = Dimensions.get("window").width;
export const height = Dimensions.get("window").height;
// Urls
//**** DONT FORGET TO UPDATE THE APP VERSION IN WEBSERVICE
export const appVersion = "v1.8.6"; //**** DONT FORGET TO UPDATE THE APP VERSION IN WEBSERVICE
//**** DONT FORGET TO UPDATE THE APP VERSION IN WEBSERVICE
export const serverBaseUrl = "https://puresoft.ddns.net";
export const serverPublicBaseUrl = "https://puresoft.ddns.net";
export const attachmentPath = serverPublicBaseUrl + "/pick/faces/attachments/hygex";
export const pickServerUrl =
  serverBaseUrl +
  "/pick/faces/redirect/hygex?connector=HYGEX.CONNECTOR&appversion=" +
  appVersion +
  "&";
export const pickPublicServerUrl =
  serverPublicBaseUrl
"/pick/faces/redirect/hygex?connector=HYGEX.CONNECTOR&appversion=" +
  appVersion +
  "&";

export const serverAttachmentsBaseUrl =
  serverPublicBaseUrl + "/pick/faces/attachments";
export const CURRENT_SERVER = "CURRENT_SERVER";
export const CURRENT_SERVER_IP = "CURRENT_SERVER_IP";
// User
export const cur_user = "cur.user";

// Codes
export const networkError_code = 100;

// Actions
export const CHECK_LOGIN = "CHECK.LOGIN";
export const UPLOAD = "UPLOAD";
export const SEND_USER_TOKEN = "SEND.USER.TOKEN";
export const GET_SERVER_TOKEN = "GET.SERVER.TOKEN";
export const GET_VISIT_ID = "GET.VISIT.ID";
export const SAVE_VISIT = "SAVE.VISIT";
export const GET_CUSTOMERS = "GET.CUSTOMERS";
export const GET_ROUTE_CUSTOMERS = "GET.ROUTE.CUSTOMERS";
export const GET_POTENTIAL_CUSTOMERS = "GET.POTENTIAL.CUSTOMERS";
export const GET_DEPARTMENTS = "GET.DEPARTMENTS";
export const GET_SOURCES = "GET.SOURCES";
export const GET_REQUESTS = "GET.REQUESTS";
export const GET_ACTIONS = "GET.ACTIONS";
export const GET_REQ_ACTIONS = "GET.REQ.ACTIONS";
export const GET_CUSTOMER_DETAILS = "GET.CUSTOMER.DETAILS";
export const GET_POTENTIAL_CUSTOMER_DETAILS = "GET.POTENTIAL.CUSTOMER.DETAILS";
export const GET_EQUIPMENTS = "GET.EQUIPMENTS";
export const SAVE_POTENTIAL_CUSTOMER = "SAVE.POTENTIAL.CUSTOMER";
export const SAVE_ADDED_DEPARTMENTS = "SAVE.ADDED.DEPARTMENTS";
export const SAVE_ADDED_REQUESTS = "SAVE.ADDED.REQUESTS";
export const GET_CUSTOMER_VISITS = "GET.CUSTOMER.VISITS";
export const GET_VISITS = "GET.VISITS";
export const GET_VISIT_DETAILS = "GET.VISIT.DETAILS";
export const GET_PENDING_ACTIONS = "GET.PENDING.ACTIONS";
export const GET_PENDING_REQUESTS = "GET.PENDING.REQUESTS";
export const MAKE_ACTION_DONE = "MAKE.ACTION.DONE";
export const ADD_CONTACT = "ADD.CONTACT";
export const CHECK_POTENTIAL_CUSTOMER_INFO = "CHECK.POTENTIAL.CUSTOMER.INFO";
export const GET_MY_REQUESTS = "GET.MY.REQUESTS";
export const GET_BUSINESS_TYPES = "GET.BUSINESS.TYPES";
export const CHANGE_CUSTOMER_BUSINESS_TYPE = "CHANGE.CUSTOMER.BUSINESS.TYPE";
export const CHANGE_POTENTIAL_CUSTOMER_BUSINESS_TYPE = "CHANGE.POTENTIAL.CUSTOMER.BUSINESS.TYPE";
export const CAN_EDIT_VISIT = "CAN.EDIT.VISIT";
export const GET_SALESMEN = "GET.SALESMEN";
export const GET_MAINTENANCE_USERS = "GET.MAINTENANCE.USERS";
export const ASSIGN_VISIT = "ASSIGN.VISIT";
export const SAVE_ROUTE_CUSTOMERS = "SAVE.ROUTE.CUSTOMERS";
export const GET_USER_ROUTE_CUSTOMERS = "GET.USER.ROUTE.CUSTOMERS";
export const GET_SERVER_TIME = "GET.SERVER.TIME";
export const GET_ROUTE_POTENTIAL_CUSTOMERS = "GET.ROUTE.POTENTIAL.CUSTOMERS";
export const GET_REMINDERS = "GET.REMINDERS";
export const RESPOND_TO_REMINDER = "RESPOND.TO.REMINDER";