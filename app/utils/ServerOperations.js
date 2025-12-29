import { Platform } from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Constants from "./Constants";
import * as Commons from "./Commons";

const httpTimeout = (ms, promise) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("timeout"));
    }, ms);
    promise.then(resolve, reject);
  });

export const httpRequest = async (url) => {
  /* Send request */
  const TIMEOUT = 20000;

  const response = await httpTimeout(
    TIMEOUT,
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).catch((error) => {
      console.error(error);
      return Constants.networkError_code;
    })
  ).catch((error) => {
    return Constants.networkError_code;
  });

  // Check if response is valid before trying to parse JSON
  if (response === Constants.networkError_code || !response || typeof response.json !== 'function') {
    console.error('Invalid response, cannot parse JSON:', response);
    return Constants.networkError_code;
  }

  const json = await response.json();
  return json;
};

export const ping = async (url, timeout) => {
  const response = await httpTimeout(
    timeout,
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "action=",
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("HTTP response status not code 200 as expected.");
        }
      })
      .catch((error) => {
        console.error(error);
        return Constants.networkError_code;
      })
  ).catch((error) => {
    console.log(error);
    return Constants.networkError_code;
  });
  return response;
};

// Helper function to convert Arabic numbers to English numbers
const convertArabicToEnglishNumbers = (text) => {
  if (!text || typeof text !== 'string') return text;

  const result = text
    .replace(/١/g, '1')
    .replace(/٢/g, '2')
    .replace(/٣/g, '3')
    .replace(/٤/g, '4')
    .replace(/٥/g, '5')
    .replace(/٦/g, '6')
    .replace(/٧/g, '7')
    .replace(/٨/g, '8')
    .replace(/٩/g, '9')
    .replace(/٠/g, '0');

  if (result !== text) {
    console.log(`Arabic numbers converted: "${text}" → "${result}"`);
  }

  return result;
};

// Helper function to convert .m4a file extensions to .mp3
const convertM4aToMp3 = (text) => {
  if (!text || typeof text !== 'string') return text;

  const result = text.replace(/\.m4a$/gi, '.mp3');

  return result;
};// Enhanced encodeURIComponent that handles Arabic numbers and file extensions
const safeEncodeURIComponent = (value) => {
  const stringValue = String(value || '');
  const convertedNumbers = convertArabicToEnglishNumbers(stringValue);
  const convertedExtensions = convertM4aToMp3(convertedNumbers);
  return encodeURIComponent(convertedExtensions);
};

export const pickHttpRequest = async (params) => {
  /* Send request */
  // Convert Arabic numbers to English numbers in the entire params string
  params = convertArabicToEnglishNumbers(params);
  // Convert .m4a extensions to .mp3 in the entire params string
  params = convertM4aToMp3(params);

  const TIMEOUT = 20000;
  const user = safeEncodeURIComponent(await Commons.getFromAS("userID"));
  const url = Constants.pickServerUrl + params + "&currentuser=" + user;

  console.log(url);

  const response = await httpTimeout(
    TIMEOUT,
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }).catch((error) => {
      console.error(error);
      return Constants.networkError_code;
    })
  ).catch((error) => {
    return Constants.networkError_code;
  });

  return response;
};

export const pickUploadHttpRequest = async (file) => {
  /* Send request */
  const TIMEOUT = 45000;
  const url = `${Constants.serverBaseUrl}/pick/faces/redirect/hygex?connector=HYGEX.CONNECTOR&action=upload&fileupload=y&fname=${file.name}`;

  console.log('Uploading file to URL:', url);
  console.log('File details:', file);

  // Defensive check: ensure local files exist and are non-zero before uploading
  try {
    if (file && file.uri && file.uri.startsWith('file')) {
      const fileObj = new FileSystem.File(file.uri);
      const exists = fileObj.exists;
      const size = fileObj.size;
      console.log('Local file info before upload:', { exists, size });
      if (!exists || size === 0) {
        console.error('File missing or zero-sized, aborting upload', { exists, size });
        return { ok: false, error: 'file_missing_or_zero_size' };
      }
    }
  } catch (e) {
    console.warn('Could not stat local file before upload', e);
    // continue - try upload; server may accept streaming of content URIs
  }

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type || 'application/octet-stream',
  });

  try {
    const response = await Promise.race([
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), TIMEOUT)),
    ]);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Upload successful:', responseData);
    return responseData;
  } catch (error) {
    console.error('Upload error:', error);
    return Constants.networkError_code;
  }

};


export const checkLogin = async (userID, password) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.CHECK_LOGIN}`;
  params += `&USER=${safeEncodeURIComponent(userID)}`;
  params += `&PASSWORD=${safeEncodeURIComponent(password)}`;
  params += `&APP.VERSION=${safeEncodeURIComponent(Constants.appVersion)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};
export const getVisitID = async () => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_VISIT_ID}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getCustomers = async (user) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_CUSTOMERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getRouteCustomers = async (user) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_ROUTE_CUSTOMERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;

};

export const getRoutePotentialCustomers = async (user) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_ROUTE_POTENTIAL_CUSTOMERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};
export const getPotentialCustomers = async (user) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_POTENTIAL_CUSTOMERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const addContact = async (customer, customerType, newContactName, newContactPosition, newContactPhone, newContactEmail, selectedDepartment) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.ADD_CONTACT}`;
  params += `&CUSTOMER=${safeEncodeURIComponent(customer)}`;
  params += `&CUSTOMER.TYPE=${safeEncodeURIComponent(customerType)}`;
  params += `&CONTACT.NAME=${safeEncodeURIComponent(newContactName)}`;
  params += `&CONTACT.POSITION=${safeEncodeURIComponent(newContactPosition)}`;
  params += `&CONTACT.PHONE=${safeEncodeURIComponent(newContactPhone)}`;
  params += `&CONTACT.EMAIL=${safeEncodeURIComponent(newContactEmail)}`;
  params += `&DEPARTMENT=${safeEncodeURIComponent(selectedDepartment)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getDepartments = async () => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_DEPARTMENTS}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getSources = async () => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_SOURCES}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getRequests = async () => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_REQUESTS}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getCustomerDetails = async (customer, branch) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_CUSTOMER_DETAILS}`;
  params += `&CUSTOMER=${safeEncodeURIComponent(customer)}`;
  params += `&BRANCH=${safeEncodeURIComponent(branch)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getPotentialCustomerDetails = async (customer) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_POTENTIAL_CUSTOMER_DETAILS}`;
  params += `&CUSTOMER=${customer}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const savePotentialCustomer = async (
  customerName,
  contactPerson,
  contactPersonPhone,
  contactPersonPosition,
  customerAddress,
  selectedSource,
  selectedBusinessType,
  phone,
  email,
  numOfBranches,
  employeeCount,
  customerValue,
  customValue,
  curUser,
  atts,
  custID,
  paymentTerm
) => {
  /* Request params */
  let params = "";
  customerName = safeEncodeURIComponent(customerName);
  contactPerson = safeEncodeURIComponent(contactPerson);
  contactPersonPhone = safeEncodeURIComponent(contactPersonPhone);
  contactPersonPosition = safeEncodeURIComponent(contactPersonPosition);
  customerAddress = safeEncodeURIComponent(customerAddress);
  selectedSource = safeEncodeURIComponent(selectedSource);
  selectedBusinessType = safeEncodeURIComponent(selectedBusinessType);
  phone = safeEncodeURIComponent(phone);
  email = safeEncodeURIComponent(email);
  numOfBranches = safeEncodeURIComponent(numOfBranches);
  employeeCount = safeEncodeURIComponent(employeeCount);
  customerValue = safeEncodeURIComponent(customerValue);
  customValue = safeEncodeURIComponent(customValue);
  curUser = safeEncodeURIComponent(curUser);
  atts = safeEncodeURIComponent(atts);
  custID = safeEncodeURIComponent(custID);
  params += `action=${Constants.SAVE_POTENTIAL_CUSTOMER}`;
  params += `&CUSTOMER.NAME=${customerName}`;
  params += `&CONTACT.PERSON=${contactPerson}`;
  params += `&CONTACT.PERSON.PHONE=${contactPersonPhone}`;
  params += `&CONTACT.PERSON.POSITION=${contactPersonPosition}`;
  params += `&CUSTOMER.ADDRESS=${customerAddress}`;
  params += `&SOURCE=${selectedSource}`;
  params += `&BUSINESS.TYPE=${selectedBusinessType}`;
  params += `&PHONE=${phone}`;
  params += `&EMAIL=${email}`;
  params += `&NUM.OF.BRANCHES=${numOfBranches}`;
  params += `&EMPLOYEE.COUNT=${employeeCount}`;
  params += `&CUSTOMER.VALUE=${customerValue}`;
  params += `&CUSTOM.VALUE=${customValue}`;
  params += `&SALESMAN=${curUser}`;
  params += `&ATTS=${atts}`;
  params += `&CUST.ID=${custID}`;
  params += `&PAYMENT.TERM=${safeEncodeURIComponent(paymentTerm)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const changeCustomerBusinessType = async (customer, businessType) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.CHANGE_CUSTOMER_BUSINESS_TYPE}`;
  params += `&CUSTOMER=${safeEncodeURIComponent(customer)}`;
  params += `&BUSINESS.TYPE=${safeEncodeURIComponent(businessType)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const changePotentialCustomerBusinessType = async (customer, businessType) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.CHANGE_POTENTIAL_CUSTOMER_BUSINESS_TYPE}`;
  params += `&CUSTOMER=${safeEncodeURIComponent(customer)}`;
  params += `&BUSINESS.TYPE=${safeEncodeURIComponent(businessType)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const checkPotentialCustomerInfo = async (customer) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.CHECK_POTENTIAL_CUSTOMER_INFO}`;
  params += `&CUSTOMER=${safeEncodeURIComponent(customer)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getEquipments = async (customer) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_EQUIPMENTS}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getActions = async (type, custType) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_ACTIONS}`;
  params += `&TYPE=${type}`;
  params += `&CUST.TYPE=${custType}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getCustomerVisits = async (customer, custType, branch) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_CUSTOMER_VISITS}`;
  params += `&CUSTOMER=${customer}`;
  params += `&CUSTOMER.TYPE=${custType}`;
  params += `&BRANCH=${branch}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};
export const getPendingActions = async (user, fromDate, toDate) => {
  /* Request params */
  let params = "";
  user = safeEncodeURIComponent(user);
  fromDate = safeEncodeURIComponent(fromDate);
  toDate = safeEncodeURIComponent(toDate);
  params += `action=${Constants.GET_PENDING_ACTIONS}`;
  params += `&USER=${user}`;
  params += `&FROM.DATE=${fromDate}`;
  params += `&TO.DATE=${toDate}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getMyRequests = async (user, fromDate, toDate, requestStatus) => {
  /* Request params */
  let params = "";
  user = safeEncodeURIComponent(user);
  fromDate = safeEncodeURIComponent(fromDate);
  toDate = safeEncodeURIComponent(toDate);
  requestStatus = safeEncodeURIComponent(requestStatus);
  params += `action=${Constants.GET_MY_REQUESTS}`;
  params += `&USER=${user}`;
  params += `&FROM.DATE=${fromDate}`;
  params += `&TO.DATE=${toDate}`;
  params += `&REQUEST.STATUS=${requestStatus}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};
export const getPendingRequests = async (user, fromDate, toDate) => {
  /* Request params */
  let params = "";
  user = safeEncodeURIComponent(user);
  fromDate = safeEncodeURIComponent(fromDate);
  toDate = safeEncodeURIComponent(toDate);
  params += `action=${Constants.GET_PENDING_REQUESTS}`;
  params += `&USER=${user}`;
  params += `&FROM.DATE=${fromDate}`;
  params += `&TO.DATE=${toDate}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const makeActionDone = async (actionID) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.MAKE_ACTION_DONE}`;
  params += `&ACTION.ID=${actionID}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};
export const getVisits = async (customer, fromDate, toDate, user, customerType, type) => {
  /* Request params */
  let params = "";
  customer = safeEncodeURIComponent(customer);
  fromDate = safeEncodeURIComponent(fromDate);
  toDate = safeEncodeURIComponent(toDate);
  user = safeEncodeURIComponent(user);
  customerType = safeEncodeURIComponent(customerType);
  params += `action=${Constants.GET_VISITS}`;
  params += `&CUSTOMER=${customer}`;
  params += `&FROM.DATE=${fromDate}`;
  params += `&TO.DATE=${toDate}`;
  params += `&USER=${user}`;
  params += `&CUST.TYPE=${customerType}`;
  params += `&TYPE=${type}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getReminders = async (user, fromDate, toDate, isDone) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_REMINDERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;
  params += `&FROM.DATE=${safeEncodeURIComponent(fromDate)}`;
  params += `&TO.DATE=${safeEncodeURIComponent(toDate)}`;
  params += `&IS.DONE=${safeEncodeURIComponent(isDone)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const respondToReminder = async (reminderId, isDone, replyNotes) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.RESPOND_TO_REMINDER}`;
  params += `&REMINDER.ID=${safeEncodeURIComponent(reminderId)}`;
  params += `&IS.DONE=${safeEncodeURIComponent(isDone)}`;
  params += `&REPLY.NOTES=${safeEncodeURIComponent(replyNotes || '')}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const assignVisit = async (fromSalesman, toSalesman, customerId, date, branch) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.ASSIGN_VISIT}`;
  params += `&FROM.SALESMAN=${safeEncodeURIComponent(fromSalesman)}`;
  params += `&TO.SALESMAN=${safeEncodeURIComponent(toSalesman)}`;
  params += `&CUSTOMER.ID=${safeEncodeURIComponent(customerId)}`;
  params += `&DATE=${safeEncodeURIComponent(date)}`;
  params += `&BRANCH=${safeEncodeURIComponent(branch)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getSalesmen = async (user) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_SALESMEN}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
}

export const getMaintenanceUsers = async (user) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_MAINTENANCE_USERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
}

export const canEditVisit = async (visitID, user, currentDate) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.CAN_EDIT_VISIT}`;
  params += `&VISIT.ID=${safeEncodeURIComponent(visitID)}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;
  params += `&DATE=${safeEncodeURIComponent(currentDate)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getVisitDetails = async (visit) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_VISIT_DETAILS}`;
  params += `&VISIT=${visit}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getReqActions = async (type) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_REQ_ACTIONS}`;
  params += `&TYPE=${type}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getBusinessTypes = async () => {
  let params = "";
  params += `action=${Constants.GET_BUSINESS_TYPES}`;

  const response = await pickHttpRequest(params);

  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getServerToken = async (user) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_SERVER_TOKEN}`;
  params += `&USER=${user}`;
  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};
export const sendUserToken = async (user, token, devid) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.SEND_USER_TOKEN}`;
  params += `&USER=${user}`;
  params += `&TOKEN=${token}`;
  params += `&DEVID=${devid}`;
  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const getUserRouteCustomers = async (user, date) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_USER_ROUTE_CUSTOMERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;
  params += `&DATE=${safeEncodeURIComponent(date)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const saveRouteCustomers = async (user, date, customers, potentialCustomers) => {
  /* Request params */
  let params = "";
  params += `action=${Constants.SAVE_ROUTE_CUSTOMERS}`;
  params += `&USER=${safeEncodeURIComponent(user)}`;
  params += `&DATE=${safeEncodeURIComponent(date)}`;
  params += `&CUSTOMERS=${safeEncodeURIComponent(customers)}`;
  params += `&POTENTIAL.CUSTOMERS=${safeEncodeURIComponent(potentialCustomers)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};

export const saveVisit = async (
  selectedType,
  selectedVisitType,
  callDuration,
  addedDeps,
  addedReqs,
  curUser,
  selectedCust,
  custType,
  visitID,
  customerStatus,
  discardReason,
  startLocation,
  endLocation,
  pendingVisitID,
  pendingReqID,
  branch,
  visitStartTime,
  visitNotes,
  visitAttachments
) => {
  /* Request params */
  let params = "";
  params += `action=${safeEncodeURIComponent(Constants.SAVE_VISIT)}`;
  params += `&VISIT.OR.CALL=${safeEncodeURIComponent(selectedType)}`;
  params += `&VISIT.TYPE=${safeEncodeURIComponent(selectedVisitType)}`;
  params += `&CALL.DURATION=${safeEncodeURIComponent(callDuration)}`;
  params += `&DEPS=${safeEncodeURIComponent(addedDeps)}`;
  params += `&REQS=${safeEncodeURIComponent(addedReqs)}`;
  params += `&USER=${safeEncodeURIComponent(curUser)}`;
  params += `&CUST=${safeEncodeURIComponent(selectedCust)}`;
  params += `&CUST.TYPE=${safeEncodeURIComponent(custType)}`;
  params += `&VISIT.ID=${safeEncodeURIComponent(visitID)}`;
  params += `&CUSTOMER.STATUS=${safeEncodeURIComponent(customerStatus)}`;
  params += `&DISCARD.REASON=${safeEncodeURIComponent(discardReason)}`;
  params += `&START.LOCATION=${safeEncodeURIComponent(startLocation)}`;
  params += `&END.LOCATION=${safeEncodeURIComponent(endLocation)}`;
  params += `&PENDING.ACT.ID=${safeEncodeURIComponent(pendingVisitID)}`;
  params += `&PENDING.REQ.ID=${safeEncodeURIComponent(pendingReqID)}`;
  params += `&BRANCH=${safeEncodeURIComponent(branch)}`;
  params += `&VISIT.START.TIME=${safeEncodeURIComponent(visitStartTime)}`;
  params += `&VISIT.NOTES=${safeEncodeURIComponent(visitNotes)}`;
  params += `&VISIT.ATTS=${safeEncodeURIComponent(visitAttachments)}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};


export const getServerTime = async () => {
  /* Request params */
  let params = "";
  params += `action=${Constants.GET_SERVER_TIME}`;

  /* Send request */
  const response = await pickHttpRequest(params);

  /* Check response */
  if (response === Constants.networkError_code) {
    return null;
  }
  if (response.ok) {
    return await response.json();
  }

  return null;
};


