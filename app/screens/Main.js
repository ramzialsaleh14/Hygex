import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Modal, TextInput, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import Constants from "expo-constants";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
  Image,
  FlatList,
  I18nManager,
  Dimensions,
  ScrollView,
  Linking
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Camera, CameraType, useCameraPermissions, CameraView } from "expo-camera";
import { Picker } from "@react-native-picker/picker";
import * as Constants2 from "../utils/Constants";
import * as Notifications from "expo-notifications";
import * as ServerOperations from "../utils/ServerOperations";
import * as Commons from "../utils/Commons";
import i18n from "../languages/langStrings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import moment from "moment";
import ProgressDialog from '../components/ProgressDialog';
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import * as Application from "expo-application";
import * as MediaLibrary from "expo-media-library";
import * as actions from "../actions/main";
import { height, width } from "../utils/Styles";
import Color, { White } from 'react-native-material-color';
import { Dialog, Paragraph } from "react-native-paper";
import DropDownPicker from 'react-native-dropdown-picker';

TouchableOpacity.defaultProps = { activeOpacity: 0.8 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function MainScreen({ navigation, route }) {
  const [curUser, setCurUser] = useState("");
  const [progressDialogVisible, setProggressDialogVisible] = useState(false);
  const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false);
  const [showMyVisitsFiltersModal, setShowMyVisitsFiltersModal] = useState(false);
  const [showRemindersFiltersModal, setShowRemindersFiltersModal] = useState(false);
  const [showPendingVisitsFiltersModal, setShowPendingVisitsFiltersModal] = useState(false);
  const [showPendingRequestsFiltersModal, setShowPendingRequestsFiltersModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cameraPermission, setCameraPermission] = useCameraPermissions();
  const [visitCustomer, setVisitCustomer] = useState("");
  const [fitleredCustomersList, setFilteredCustomersList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [fitleredPotentailCustomersList, setFilteredPotentialCustomersList] = useState([]);
  const [potentialCustomersList, setPotentialCustomersList] = useState([]);
  const [curLang, setCurLang] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [customerType, setCustomerType] = useState("");
  const [custModalType, setCustModalType] = useState("");
  const [empType, setEmpType] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState("");
  const [modalCaller, setModalCaller] = useState("NewVisit");
  const [pendingActions, setPendingActions] = useState([]);
  const [filteredPendingActions, setFilteredPendingActions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [filteredPendingRequests, setFilteredPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [filteredMyRequests, setFilteredMyRequests] = useState([]);
  const [showPendingVisitsModal, setShowPendingVisitsModal] = useState(false);
  const [showPendingRequestsModal, setShowPendingRequestsModal] = useState(false);
  const [showMyRequestsModal, setShowMyRequestsModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filtersCaller, setFiltersCaller] = useState("");
  const [selectedPendingVisitId, setSelectedPendingVisitId] = useState("");
  const [selectedPendingRequestId, setSelectedPendingRequestId] = useState("");
  const [requestStatus, setRequestStatus] = useState("Done");
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [showAssignVisitModal, setShowAssignVisitModal] = useState(false);
  const [salesmanList, setSalesmanList] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [selectedSalesmanName, setSelectedSalesmanName] = useState("");
  const [assignedCustomer, setAssignedCustomer] = useState("");
  const [assignedCustomerName, setAssignedCustomerName] = useState("");
  const [assignedCustomerAddresses, setAssignedCustomerAddresses] = useState([]);
  const [assignedSelectedBranch, setAssignedSelectedBranch] = useState("");
  const [showAssignedBranchModal, setShowAssignedBranchModal] = useState(false);
  const [assignedDate, setAssignedDate] = useState(new Date());
  const [showAssignedDatePicker, setShowAssignedDatePicker] = useState(false);
  const [showSalesmanModal, setShowSalesmanModal] = useState(false);
  const [showAssignCustomerModal, setShowAssignCustomerModal] = useState(false);
  const [showDefineRouteModal, setShowDefineRouteModal] = useState(false);
  const [showRouteCustomersModal, setShowRouteCustomersModal] = useState(false);
  const [routeDate, setRouteDate] = useState(new Date());
  const [showRouteDatePicker, setShowRouteDatePicker] = useState(false);
  const [routeCustomers, setRouteCustomers] = useState([]);
  const [filteredRouteCustomers, setFilteredRouteCustomers] = useState([]);
  const [routePotentialCustomers, setRoutePotentialCustomers] = useState([]);
  const [filteredRoutePotentialCustomers, setFilteredRoutePotentialCustomers] = useState([]);
  const [routeCustomerType, setRouteCustomerType] = useState("Existing"); // "Existing" or "Potential"
  const [visitCallOpen, setVisitCallOpen] = useState(false);
  const [selectedTypeFilters, setSelectedTypeFilters] = useState("");

  // --- Location Prewarm (for New Visit flow) ---
  const prewarmRef = useRef(false);
  const prewarmLocation = useCallback(async () => {
    if (prewarmRef.current) {
      return; // avoid spamming watches
    }
    prewarmRef.current = true;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        prewarmRef.current = false; // allow retry if user later grants
        return;
      }
      // Start a short-lived watcher to encourage a fresh GNSS/Wi‑Fi fix.
      let stopped = false;
      const watcher = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
        distanceInterval: 0
      }, (loc) => {
        // Once we get a reasonably bounded accuracy (<= 800m) stop early.
        if (!stopped && loc?.coords?.accuracy && loc.coords.accuracy <= 800) {
          try { watcher.remove(); } catch (_) { }
          stopped = true;
        }
      });
      // Hard stop after 6 seconds if not already
      setTimeout(() => {
        if (!stopped) {
          try { watcher.remove(); } catch (_) { }
          stopped = true;
        }
      }, 6000);
    } catch (e) {
      console.log('Prewarm location error:', e.message);
    } finally {
      // Allow another prewarm after some cooldown (e.g., 25s)
      setTimeout(() => { prewarmRef.current = false; }, 25000);
    }
  }, []);

  // Maintenance users state
  const [maintenanceUsers, setMaintenanceUsers] = useState([]);
  const [showMaintenanceUsersModal, setShowMaintenanceUsersModal] = useState(false);
  const [selectedMaintenanceUser, setSelectedMaintenanceUser] = useState("");
  const [selectedMaintenanceUserName, setSelectedMaintenanceUserName] = useState("");
  const [visitCallItems, setVisitCallItems] = useState([
    { label: i18n.t("All"), value: "" },
    { label: i18n.t("visit"), value: "Visit" },
    { label: i18n.t("call"), value: "Call" },
    { label: i18n.t("requests"), value: "Request" },
    { label: i18n.t("priceOffer"), value: "Price Offer" },
  ]);


  const onFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDatePicker(Platform.OS === 'ios');
    setFromDate(currentDate);
    if (currentDate > toDate) {
      setToDate(currentDate);
    }
  };

  const onToDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDatePicker(Platform.OS === 'ios');
    setToDate(currentDate);
  };


  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []) // Empty dependency array
  );

  const permisionFunction = async () => {
    // here is how you can get the camera permission
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraPermission.status === "granted");
    if (cameraPermission.status !== "granted") {
      alert("Permission for media access needed.");
    }
  };


  useEffect(() => {
    setProggressDialogVisible(true);
    getCurUser();
    permisionFunction();
    MediaLibrary.requestPermissionsAsync();
    (async () => {
      await actions.registerUserToken(navigation);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Commons.okAlert('Permission to access location was denied');
        return;
      }
      setProggressDialogVisible(true);
      const currentlang = await Commons.getFromAS("lang");
      const empType = await Commons.getFromAS("type");
      setCurLang(currentlang);
      setEmpType(empType);
      setProggressDialogVisible(false);
    })();
    setProggressDialogVisible(false);
  }, []);

  const loadData = async () => {
    try {
      setProggressDialogVisible(true);
      let custlist = [];
      const empType = await Commons.getFromAS("type");
      const currentUser = await Commons.getFromAS("userID");
      const today = moment().format("DD/MM/YYYY");

      // Customers
      custlist = await ServerOperations.getCustomers(empType == 'Salesman' ? currentUser : "");
      if (custlist && Array.isArray(custlist)) {
        setCustomersList(custlist);
        setFilteredCustomersList(custlist);
      }

      // Potential customers
      const potcustlist = await ServerOperations.getPotentialCustomers(currentUser);
      if (potcustlist && Array.isArray(potcustlist)) {
        setPotentialCustomersList(potcustlist);
        setFilteredPotentialCustomersList(potcustlist);
      }

      // Pending actions
      const actionsList = await ServerOperations.getPendingActions(currentUser, today, today);
      if (actionsList && Array.isArray(actionsList)) {
        setPendingActions(actionsList);
        setFilteredPendingActions(actionsList);
      }

      // Pending requests
      const pendingReqs = await ServerOperations.getPendingRequests(currentUser, today, today);
      if (pendingReqs && Array.isArray(pendingReqs)) {
        setPendingRequests(pendingReqs);
        setFilteredPendingRequests(pendingReqs);
      }

      // My requests
      const reqStatus = requestStatus || 'Done';
      const myReqs = await ServerOperations.getMyRequests(currentUser, today, today, reqStatus);
      if (myReqs && Array.isArray(myReqs)) {
        setMyRequests(myReqs);
        setFilteredMyRequests(myReqs);
      }

      // Salesmen (if manager)
      if (empType !== 'Salesman') {
        const salesmen = await ServerOperations.getSalesmen(currentUser);
        if (salesmen && Array.isArray(salesmen)) setSalesmanList(salesmen);
      }
    } catch (e) {
      console.error('Error in loadData root', e);
    } finally {
      setProggressDialogVisible(false);
    }
  }

  useEffect(() => {
    (async () => {
      loadData();
      const currentUser = await Commons.getFromAS("userID");
    })();
  }, [refresh]);

  // Handle language changes when returning to screen
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const currentlang = await Commons.getFromAS("lang");
        if (currentlang !== curLang) {
          setCurLang(currentlang);
          // Force re-render when language has changed
          setRefresh(prev => !prev);
        }
      })();
    }, [curLang])
  );

  // Add this function:
  const loadSalesmen = async () => {
    try {
      const currentUser = await Commons.getFromAS("userID");
      const salesmen = await ServerOperations.getSalesmen(currentUser); // You'll need to implement this API call
      if (salesmen) {
        setSalesmanList(salesmen);
      }
    } catch (error) {
      console.error("Error loading salesmen:", error);
    }
  };

  // Add this function with your other handlers:
  const onAssignedDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || assignedDate;
    setShowAssignedDatePicker(Platform.OS === 'ios');
    setAssignedDate(currentDate);
  };

  // Add route date handler:
  const onRouteDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || routeDate;
    setShowRouteDatePicker(Platform.OS === 'ios');
    setRouteDate(currentDate);
    // Load route customers when date changes
    loadRouteCustomers(currentDate);
  };

  // Add function to load route customers:
  const loadRouteCustomers = async (date = routeDate) => {
    try {
      setProggressDialogVisible(true);
      const formattedDate = moment(date).format("DD/MM/YYYY");
      const routeData = await ServerOperations.getUserRouteCustomers(curUser, formattedDate);

      if (routeData) {
        // Expect the API to return an object with existingCustomers and potentialCustomers arrays
        const { existingCustomers = [], potentialCustomers = [] } = routeData;

        setRouteCustomers(existingCustomers);
        setRoutePotentialCustomers(potentialCustomers);
      } else {
        setRouteCustomers([]);
        setRoutePotentialCustomers([]);
      }
    } catch (error) {
      console.error("Error loading route customers:", error);
      setRouteCustomers([]);
      setRoutePotentialCustomers([]);
    } finally {
      setProggressDialogVisible(false);
    }
  };

  // Add this render function:
  const renderSalesmanModal = () => {
    return (
      <Modal
        visible={showSalesmanModal}
        onDismiss={() => setShowSalesmanModal(false)}
        contentContainerStyle={styles.modalStyle}
      >
        <Text style={styles.modalTitle}>{i18n.t("selectSalesman")}</Text>
        <FlatList
          keyExtractor={(item) => item.ID}
          data={salesmanList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedSalesman(item.ID);
                setSelectedSalesmanName(item.NAME);
                setShowSalesmanModal(false);
              }}
              style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}
            >
              <Text style={{ color: "red", marginRight: 10 }}>{item.ID}</Text>
              <Text>{item.NAME}</Text>
            </TouchableOpacity>
          )}
        />
        <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => setShowSalesmanModal(false)}>
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button>
      </Modal>
    );
  };

  // Add this render function:
  const renderAssignCustomerModal = () => {
    return (
      <Modal
        visible={showAssignCustomerModal}
        onDismiss={() => {
          setSearchText(""); // Clear search when modal closes
          setShowAssignCustomerModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.inputBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            const list = Commons.handleSearch(text, customersList);
            setFilteredCustomersList(list);
          }}
        />
        <Text style={styles.modalTitle}>{i18n.t("selectCustomer")}</Text>
        <FlatList
          keyExtractor={(item) => item.CODE}
          data={fitleredCustomersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={async () => {
                setAssignedCustomer(item.CODE);
                setAssignedCustomerName(item.NAME);
                // Load customer addresses for branch selection
                setAssignedCustomerAddresses(item.ADDRESSES || []);
                setAssignedSelectedBranch(""); // Reset branch selection
                setShowAssignCustomerModal(false);
              }}
              style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}
            >
              <Text style={{ color: "red", marginRight: 10 }}>{item.CODE}</Text>
              <Text>{item.NAME}</Text>
            </TouchableOpacity>
          )}
        />
        <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => {
          setSearchText(""); // Clear search when closing modal
          setShowAssignCustomerModal(false);
        }}>
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button>
      </Modal>
    );
  };

  // Add assigned branch modal render function:
  const renderAssignedBranchModal = () => {
    return (
      <Modal
        visible={showAssignedBranchModal}
        onDismiss={() => {
          setSearchText(""); // Clear search when modal closes
          setShowAssignedBranchModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <Text style={styles.modalTitle}>{i18n.t("selectBranch")}</Text>
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.searchBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            const list = Commons.handleSearch(text, assignedCustomerAddresses);
            setFilteredAddresses(list);
          }}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={searchText ? filteredAddresses : assignedCustomerAddresses}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                setAssignedSelectedBranch(item.ADDRESS_ID);
                setSearchText(""); // Clear search text
                setShowAssignedBranchModal(false);
              }}
              style={styles.branchItem}
            >
              <Text style={{ color: "red", alignSelf: 'center', fontWeight: "bold", marginHorizontal: 10 }}>{index + 1}</Text>
              <Text style={{ alignSelf: 'center', fontWeight: "bold" }}>{item.ADDRESS_ID}</Text>
            </TouchableOpacity>
          )}
        />
        <Button
          mode="contained"
          style={{ borderRadius: 0 }}
          onPress={() => {
            setSearchText(""); // Clear search when closing modal
            setShowAssignedBranchModal(false);
          }}
        >
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button>
      </Modal>
    );
  };

  // Add this render function:
  const renderAssignVisitModal = () => {
    return (
      <Modal
        visible={showAssignVisitModal}
        onDismiss={() => setShowAssignVisitModal(false)}
        contentContainerStyle={styles.modalStyle2}
      >
        <Text style={styles.modalTitle}>{i18n.t("assignVisit")}</Text>

        <TouchableOpacity onPress={() => setShowSalesmanModal(true)}>
          <TextInput
            label={i18n.t("selectSalesman")}
            value={selectedSalesmanName}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setSearchText(""); // Clear search when opening modal
          setShowAssignCustomerModal(true);
        }}>
          <TextInput
            label={i18n.t("selectCustomer")}
            value={assignedCustomerName}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {/* Add branch selection - only show if customer is selected and has addresses */}
        {assignedCustomer && assignedCustomerAddresses.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchText(""); // Clear search when opening modal
            setShowAssignedBranchModal(true);
          }}>
            <TextInput
              label={i18n.t("selectBranch")}
              value={assignedSelectedBranch}
              disabled={true}
              style={styles.inputBox}
              pointerEvents="none"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setShowAssignedDatePicker(true)}>
          <TextInput
            label={i18n.t("selectDate")}
            value={moment(assignedDate).format("DD/MM/YYYY")}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {showAssignedDatePicker && (
          <DateTimePicker
            value={assignedDate}
            mode="date"
            display="default"
            onChange={onAssignedDateChange}
          />
        )}

        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <Button
            mode="contained"
            style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }}
            onPress={() => setShowAssignVisitModal(false)}
          >
            <Text style={styles.text}>{i18n.t("cancel")}</Text>
          </Button>
          <Button
            mode="contained"
            style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }}
            onPress={async () => {
              // Validate required fields including branch if customer has addresses
              if (!selectedSalesman || !assignedCustomer || !assignedDate) {
                Commons.okAlert(i18n.t("error"), i18n.t("pleaseSelectSalesmanAndCustomerAndDate"));
                return;
              }

              // If customer has addresses, branch selection is required
              if (assignedCustomerAddresses.length > 0 && !assignedSelectedBranch) {
                Commons.okAlert(i18n.t("error"), i18n.t("pleaseSelectBranch"));
                return;
              }

              setProggressDialogVisible(true);
              try {
                const result = await ServerOperations.assignVisit(
                  curUser,
                  selectedSalesman,
                  assignedCustomer,
                  moment(assignedDate).format("DD/MM/YYYY"),
                  assignedSelectedBranch
                );
                if (result.res) {
                  Commons.okAlert(i18n.t("success"), i18n.t("visitAssignedSuccessfully"));
                  setShowAssignVisitModal(false);
                  // Reset form
                  setSelectedSalesman("");
                  setSelectedSalesmanName("");
                  setAssignedCustomer("");
                  setAssignedCustomerName("");
                  setAssignedCustomerAddresses([]);
                  setAssignedSelectedBranch("");
                  setAssignedDate(new Date());
                } else {
                  Commons.okAlert(i18n.t("error"), i18n.t("failedToAssignVisit"));
                }
              } catch (error) {
                Commons.okAlert(i18n.t("error"), i18n.t("failedToAssignVisit"));
              }
              setProggressDialogVisible(false);
            }}
          >
            <Text style={styles.text}>{i18n.t("save")}</Text>
          </Button>
        </View>
      </Modal>
    );
  };

  const renderSelectCustomerModal = () => {
    return (
      <Modal
        visible={true}
        onDismiss={() => {
          setSearchText(""); // Clear search when modal closes
          setShowSelectCustomerModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.inputBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (customerType == "Existing") {
              const list = Commons.handleSearch(text, customersList);
              setFilteredCustomersList(list);
            } else {
              const list = Commons.handleSearch(text, potentialCustomersList);
              setFilteredPotentialCustomersList(list);
            }
          }}
        />
        <Text style={styles.modalTitle}>
          {customerType == "Existing" && i18n.t("customers")} {customerType == "Potential" && i18n.t("potentialCustomers")}
        </Text>
        <FlatList
          keyExtractor={(item) => item.CODE}
          data={customerType == "Existing" ? fitleredCustomersList : fitleredPotentailCustomersList}
          extraData={customerType == "Existing" ? fitleredCustomersList : fitleredPotentailCustomersList}
          renderItem={renderCustItem}
        />
        <Button mode="contained" style={{ borderRadius: 0 }} onPress={async () => {
          setSearchText(""); // Clear search when closing modal
          setShowSelectCustomerModal(false);
        }}>
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button>
      </Modal>
    )
  }

  const renderCustItem = ({ item }) => {
    return (
      <View>
        <TouchableOpacity
          onPress={async () => {
            if (modalCaller == "NewVisit") {
              await Commons.saveToAS("selectedCustomer", item.CODE);
              setSelectedCustomer(item.CODE);
              setSelectedCustomerName(item.NAME);
              setSelectedCustomerPhone(item.PHONE);
              setCustomerAddresses(item.ADDRESSES || []);
              setFilteredAddresses(item.ADDRESSES || []);
              setShowSelectCustomerModal(false);
              if (customerType == "Existing") {
                setSearchText(""); // Clear search when opening branch modal
                setShowBranchModal(true);
              } else {
                navigation.navigate("NewCustomerVisit", { custID: item.CODE, custName: item.NAME, phone: item.PHONE, readOnly: false, visitID: "", pendingVisitID: selectedPendingVisitId, pendingReqID: selectedPendingRequestId });
              }
            }
            if (modalCaller == "MyVisits") {
              setSelectedCustomer(item.CODE);
              setSelectedCustomerName(item.NAME);
              setSelectedCustomerPhone(item.PHONE);
            }
            if (modalCaller == "MyPotentialCustomers") {
              navigation.navigate("NewCustomerPotential", { custID: item.CODE });
            }
            setShowPendingVisitsModal(false);
            setShowPendingRequestsModal(false);
            setShowSelectCustomerModal(false);

          }}
        >
          <View
            style={{
              flexDirection: "row",
              padding: 15,
              borderWidth: 0.5,
              borderRadius: 5,
              marginBottom: 5,
              alignItems: 'flex-start'

            }}
          >
            <Text style={{ marginRight: 20, color: "red" }}>
              {item.CODE}
            </Text>
            <Text style={{ flex: 1, flexWrap: 'wrap' }}>{item.NAME}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )

  }

  const renderBranchModal = () => {
    return (
      <Modal
        visible={showBranchModal}
        onDismiss={() => {
          setSearchText(""); // Clear search when modal closes
          setShowBranchModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <Text style={styles.modalTitle}>{i18n.t("selectBranch")}</Text>
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.searchBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            const list = Commons.handleSearch(text, customerAddresses);
            setFilteredAddresses(list);
          }}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={filteredAddresses}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                if (customerType == "Existing") {
                  navigation.navigate("NewVisit", {
                    custID: selectedCustomer,
                    custName: selectedCustomerName,
                    phone: selectedCustomerPhone,
                    branch: item.ADDRESS_ID,
                    location: item.LOCATION,
                    readOnly: false,
                    visitID: "",
                    pendingVisitID: selectedPendingVisitId,
                    pendingReqID: selectedPendingRequestId,
                  });
                } else {
                  navigation.navigate("NewCustomerVisit", {
                    custID: selectedCustomer,
                    custName: selectedCustomerName,
                    phone: selectedCustomerPhone,
                    branch: item.ADDRESS_ID,
                    location: item.LOCATION,
                    readOnly: false,
                    visitID: "",
                    pendingVisitID: selectedPendingVisitId,
                    pendingReqID: selectedPendingRequestId,
                  });
                }
                setShowBranchModal(false);
              }}
              style={styles.branchItem}
            >
              <Text style={{ color: "red", alignSelf: 'center', fontWeight: "bold", marginHorizontal: 10 }}>{index + 1}</Text>
              <Text style={{ alignSelf: 'center', fontWeight: "bold" }}>{item.ADDRESS_ID}</Text>
            </TouchableOpacity>
          )}
        />
        <Button
          mode="contained"
          style={{ borderRadius: 0 }}
          onPress={() => {
            setSearchText(""); // Clear search when closing modal
            setShowBranchModal(false);
          }}
        >
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button>
      </Modal>
    );
  };

  const renderMyVisitsFiltersModal = () => {
    return (
      <Modal
        visible={true}
        onDismiss={() => {
          setShowMyVisitsFiltersModal(false);
        }}
        contentContainerStyle={styles.modalStyle2}
      >
        <Text style={styles.modalTitle}>{i18n.t("filters")} </Text>
        <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
          <TextInput
            label={i18n.t("fromDate")}
            value={moment(fromDate).format("DD/MM/YYYY")}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showFromDatePicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={onFromDateChange}
          />
        )}
        <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
          <TextInput
            label={i18n.t("toDate")}
            value={moment(toDate).format("DD/MM/YYYY")}
            minimumDate={fromDate}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showToDatePicker && (
          <DateTimePicker
            value={toDate}
            minimumDate={fromDate}
            mode="date"
            display="default"
            onChange={onToDateChange}
          />
        )}
        <View style={[styles.taskItemView(curLang)]}>
          <Text style={styles.text2(curLang)}>{i18n.t("type")} {" : "}</Text>
          <View>
            <DropDownPicker
              open={visitCallOpen}
              value={selectedTypeFilters}
              items={visitCallItems}
              setOpen={setVisitCallOpen}
              setValue={setSelectedTypeFilters}
              setItems={setVisitCallItems}
              placeholder={i18n.t("chooseAction")}
              style={[styles.dropdownStyle, {
              }]}
              textStyle={{ color: selectedTypeFilters === "" ? "gray" : "black" }}
              dropDownContainerStyle={styles.dropdownContainer}
              onChangeValue={async (value) => {
                setSelectedTypeFilters(selectedTypeFilters); // Reset to previous value
              }}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>
        </View>
        <View style={{ marginVertical: 10 }}>
          <TouchableOpacity
            onPress={() => setCustomerType("Existing")}
            style={styles.radioButton}
          >
            <Ionicons
              name={customerType === "Existing" ? "radio-button-on" : "radio-button-off"}
              size={24}
              color={Constants2.appColor}
            />
            <Text style={{ marginLeft: 8 }}>{i18n.t("customers")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCustomerType("Potential")}
            style={styles.radioButton}
          >
            <Ionicons
              name={customerType === "Potential" ? "radio-button-on" : "radio-button-off"}
              size={24}
              color={Constants2.appColor}
            />
            <Text style={{ marginLeft: 8 }}>{i18n.t("potentialCustomers")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCustomerType("")}
            style={styles.radioButton}
          >
            <Ionicons
              name={customerType === "" ? "radio-button-on" : "radio-button-off"}
              size={24}
              color={Constants2.appColor}
            />
            <Text style={{ marginLeft: 8 }}>{i18n.t("all")}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity disabled={customerType == "" ? true : false} onPress={() => { setShowSelectCustomerModal(true); setSearchText(""); setModalCaller("MyVisits") }}>
          <TextInput
            label={i18n.t("customer")}
            value={selectedCustomerName}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }}>
          <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => setShowMyVisitsFiltersModal(false)}>
            <Text style={styles.text}>{i18n.t("back")}</Text>
          </Button>
          <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => { setShowMyVisitsFiltersModal(false); navigation.navigate("MyVisits", { fromDate: moment(fromDate).format("DD/MM/YYYY"), toDate: moment(toDate).format("DD/MM/YYYY"), custID: selectedCustomer, customerType: customerType, type: selectedTypeFilters }) }}>
            <Text style={styles.text}>{i18n.t("search")}</Text>
          </Button>
        </View>
      </Modal >
    );
  };

  const renderRemindersFiltersModal = () => {
    return (
      <Modal
        visible={true}
        onDismiss={() => {
          setShowRemindersFiltersModal(false);
        }}
        contentContainerStyle={styles.modalStyle2}
      >
        <Text style={styles.modalTitle}>{i18n.t("filters")}</Text>
        <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
          <TextInput
            label={i18n.t("fromDate")}
            value={moment(fromDate).format("DD/MM/YYYY")}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showFromDatePicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={onFromDateChange}
          />
        )}
        <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
          <TextInput
            label={i18n.t("toDate")}
            value={moment(toDate).format("DD/MM/YYYY")}
            minimumDate={fromDate}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showToDatePicker && (
          <DateTimePicker
            value={toDate}
            minimumDate={fromDate}
            mode="date"
            display="default"
            onChange={onToDateChange}
          />
        )}

        <View style={{ flexDirection: "row" }}>
          <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => setShowRemindersFiltersModal(false)}>
            <Text style={styles.text}>{i18n.t("back")}</Text>
          </Button>
          <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => { setShowRemindersFiltersModal(false); navigation.navigate("Reminders", { fromDate: moment(fromDate).format("DD/MM/YYYY"), toDate: moment(toDate).format("DD/MM/YYYY") }); }}>
            <Text style={styles.text}>{i18n.t("submit")}</Text>
          </Button>
        </View>
      </Modal>
    );
  };

  const clearStorage = async () => {
    await Commons.removeFromAS("userID");
    await Commons.removeFromAS("password");
    const user = await Commons.getFromAS("userID");
    console.log(user);
    navigation.navigate("Login");
  };

  const handleAttachmentPress = (attachment) => {
    const uri = Constants2.attachmentPath + "/" + attachment;
    console.log('Open attachment', uri);
    Commons.openAttachment(uri);
  };

  const getCurUser = async () => {
    const currentUser = await Commons.getFromAS("userID");
    console.log("user = " + currentUser)
    if (currentUser == null) {
      clearStorage();
      Commons.okAlert("User Not Logged in");
    }
    setCurUser(currentUser);
  };

  const renderPendingVisitsModal = () => {
    return (
      <Modal
        visible={true}
        onDismiss={() => {
          setShowPendingVisitsModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <Text style={styles.modalTitle}>{i18n.t("pendingVisits")}</Text>
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.searchBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            const list = Commons.handleSearch(text, pendingActions);
            setFilteredPendingActions(list);
          }}
        />
        <FlatList
          keyExtractor={(item) => item.ID}
          data={filteredPendingActions}
          extraData={filteredPendingActions}
          renderItem={({ item }) => (
            <View style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}>
              <Text style={{ color: "red", alignSelf: 'center', fontWeight: "bold" }}>{curLang === "ar" ? item.DEP_AR_DESC : item.DEP_EN_DESC}</Text>
              <Text style={{ color: "red", alignSelf: 'center', fontWeight: "bold", marginVertical: 10 }}>{curLang === "ar" ? item.ACT_AR_DESC : item.ACT_EN_DESC}</Text>
              <View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row" }}>
                <Text>{i18n.t("customer")} {" : "}</Text>
                <Text style={{ flex: 1, flexWrap: 'wrap' }}>{item.CUSTOMER_NAME}</Text>
              </View>
              {item.BRANCH && (<View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row", marginTop: 10 }}>
                <Text>{i18n.t("branch")} {" : "}</Text>
                <Text>{item.BRANCH}</Text>
              </View>)}
              <View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row", marginVertical: 10 }}>
                <Text>{i18n.t("customerType")} {" : "}</Text>
                <Text>{item.CUST_TYPE}</Text>
              </View>
              <View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row" }}>
                <Text>{i18n.t("expectedDate")} {" : "}</Text>
                <Text>{item.EXPECTED_DATE}</Text>
              </View>
              <View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row", marginVertical: 10 }}>
                <Text>
                  {i18n.t("attached")} {" : "}
                </Text>
                <View style={{ flex: 1, marginLeft: 5 }}>
                  {item.ATTACHMENT && item.ATTACHMENT.includes('@@') ? (
                    // Multiple attachments
                    item.ATTACHMENT.split('@@').map((attachment, index) => (
                      <TouchableOpacity key={index} onPress={() => handleAttachmentPress(attachment)} style={{ marginBottom: 3 }}>
                        <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                          {attachment}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : item.ATTACHMENT ? (
                    // Single attachment
                    <TouchableOpacity onPress={() => handleAttachmentPress(item.ATTACHMENT)}>
                      <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                        {item.ATTACHMENT}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    // No attachment
                    <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                      {i18n.t("noAttachment")}
                    </Text>
                  )}
                </View>
              </View>

              {item.EQ_NAMES != "" && (<View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row", marginVertical: 5 }}>
                <Text style={{ paddingVertical: 5 }}>{i18n.t("equipments")} {" : "}</Text>
                <View>
                  {item.EQ_NAMES.split("@@").map((equipment, index) => (
                    <View key={item.EQ_NO}>
                      <Text key={item.EQ_NO} style={[styles.text2, { paddingVertical: 5 }]}>
                        {equipment}
                      </Text>
                      <View
                        style={{
                          borderBottomColor: 'gray',
                          borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>)}
              <Button mode="contained" icon="plus" style={{ marginTop: 20, backgroundColor: Constants2.darkBlueColor, marginHorizontal: Constants2.width / 5 }} onPress={async () => {
                await Commons.saveToAS("selectedCustomer", item.CUSTOMER);
                if (item.CUST_TYPE == "Existing") {
                  navigation.navigate("NewVisit", { custID: item.CUSTOMER, custName: item.CUSTOMER_NAME, branch: item.BRANCH, phone: item.CUSTOMER_PHONE, readOnly: false, visitID: "", pendingVisitID: item.ID, pendingReqID: "" });
                } else {
                  navigation.navigate("NewCustomerVisit", { custID: item.CUSTOMER, custName: item.CUSTOMER_NAME, phone: item.CUSTOMER_PHONE, readOnly: false, visitID: "", pendingVisitID: item.ID, pendingReqID: "" });
                }
                setShowPendingVisitsModal(false)
              }}>
                <Text style={styles.text}>{i18n.t("newVisit")}</Text>
              </Button>
            </View>

          )
          }
        />
        < Button mode="contained" style={{ borderRadius: 0 }
        } onPress={() => setShowPendingVisitsModal(false)}>
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button >
      </Modal >
    );
  };
  const renderPendingRequestsModal = () => {
    return (
      <Modal
        visible={true}
        onDismiss={() => {
          setShowPendingRequestsModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <Text style={styles.modalTitle}>{i18n.t("pendingRequests")}</Text>
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.searchBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            const list = Commons.handleSearch(text, pendingRequests);
            setFilteredPendingRequests(list);
          }}
        />
        <FlatList
          keyExtractor={(item) => item.ID}
          data={filteredPendingRequests}
          extraData={filteredPendingRequests}
          renderItem={({ item }) => (
            <View style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}>
              <Text style={styles.cardTitle}>{curLang === "ar" ? item.REQ_AR_DESC : item.REQ_EN_DESC}</Text>
              <Text style={styles.cardTitle}>{curLang === "ar" ? item.DEP_AR_DESC : item.DEP_EN_DESC}</Text>
              <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("date")} {" : "}</Text>
                <Text>{item.VISIT_DATE}</Text>
              </View>
              <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("customer")} {" : "}</Text>
                <Text style={{ flex: 1, flexWrap: 'wrap' }}>{item.CUSTOMER_NAME}</Text>
              </View>
              <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("branch")} {" : "}</Text>
                <Text style={{ flex: 1, flexWrap: 'wrap' }}>{item.CUST_BRANCH}</Text>
              </View>
              {/* <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("customerType")} {" : "}</Text>
                <Text>{item.CUST_TYPE}</Text>
              </View> */}
              <View style={[styles.cardRow(curLang), { alignItems: 'flex-start' }]}>
                <Text>{i18n.t("notes")} {" : "}</Text>
                <Text style={{ flex: 1, flexWrap: 'wrap' }}>{item.NOTES}</Text>
              </View>
              <View style={styles.cardRow(curLang)}>
                <Text>
                  {i18n.t("attached")} {" : "}
                </Text>
                <View style={{ flex: 1, marginLeft: 5 }}>
                  {item.ATTACHMENT && item.ATTACHMENT.includes('@@') ? (
                    // Multiple attachments
                    item.ATTACHMENT.split('@@').map((attachment, index) => (
                      <TouchableOpacity key={index} onPress={() => handleAttachmentPress(attachment)} style={{ marginBottom: 3 }}>
                        <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                          {attachment}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : item.ATTACHMENT ? (
                    // Single attachment
                    <TouchableOpacity onPress={() => handleAttachmentPress(item.ATTACHMENT)}>
                      <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                        {item.ATTACHMENT}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    // No attachment
                    <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                      {i18n.t("noAttachment")}
                    </Text>
                  )}
                </View>
              </View>
              <Button mode="contained" icon="plus" style={{ marginTop: 20, backgroundColor: Constants2.darkBlueColor, marginHorizontal: Constants2.width / 5 }} onPress={async () => {
                await Commons.saveToAS("selectedCustomer", item.CUSTOMER);
                console.log(item.CUSTOMER)
                if (item.CUST_TYPE == "Existing") {
                  navigation.navigate("NewVisit", { custID: item.CUSTOMER, custName: item.CUSTOMER_NAME, branch: item.CUST_BRANCH, phone: item.CUSTOMER_PHONE, readOnly: false, visitID: "", pendingVisitID: "", pendingReqID: item.ID });
                } else {
                  navigation.navigate("NewCustomerVisit", { custID: item.CUSTOMER, custName: item.CUSTOMER_NAME, phone: item.CUSTOMER_PHONE, readOnly: false, visitID: "", pendingVisitID: "", pendingReqID: item.ID });
                }
                setShowPendingRequestsModal(false);
              }}>
                <Text style={styles.text}>{i18n.t("newVisit")}</Text>
              </Button>
            </View>

          )
          }
        />
        < Button mode="contained" style={{ borderRadius: 0 }
        } onPress={() => setShowPendingRequestsModal(false)}>
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button >
      </Modal >
    );
  };

  const renderMyRequestsModal = () => {
    return (
      <Modal
        visible={true}
        onDismiss={() => {
          setShowMyRequestsModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <Text style={styles.modalTitle}>{i18n.t("myRequests")}</Text>
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.searchBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            const list = Commons.handleSearch(text, myRequests);
            setFilteredMyRequests(list);
          }}
        />
        <FlatList
          keyExtractor={(item) => item.ID}
          data={filteredMyRequests}
          extraData={filteredMyRequests}
          renderItem={({ item }) => (
            <View style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}>
              <Text style={styles.cardTitle}>{curLang === "ar" ? item.REQ_AR_DESC : item.REQ_EN_DESC}</Text>
              <Text style={styles.cardTitle}>{curLang === "ar" ? item.DEP_AR_DESC : item.DEP_EN_DESC}</Text>
              <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("date")} {" : "}</Text>
                <Text>{item.VISIT_DATE}</Text>
              </View>
              <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("customer")} {" : "}</Text>
                <Text style={{ flex: 1, flexWrap: 'wrap' }}>{item.CUSTOMER_NAME}</Text>
              </View>
              <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("customerType")} {" : "}</Text>
                <Text>{item.CUST_TYPE}</Text>
              </View>
              <View style={styles.cardRow(curLang)}>
                <Text>
                  {i18n.t("attached")} {" : "}
                </Text>
                <View style={{ flex: 1, marginLeft: 5 }}>
                  {item.ATTACHMENT && item.ATTACHMENT.includes('@@') ? (
                    // Multiple attachments
                    item.ATTACHMENT.split('@@').map((attachment, index) => (
                      <TouchableOpacity key={index} onPress={() => handleAttachmentPress(attachment)} style={{ marginBottom: 3 }}>
                        <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                          {attachment}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : item.ATTACHMENT ? (
                    // Single attachment
                    <TouchableOpacity onPress={() => handleAttachmentPress(item.ATTACHMENT)}>
                      <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                        {item.ATTACHMENT}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    // No attachment
                    <Text style={{ color: 'gray', fontStyle: 'italic' }}>
                      {i18n.t("noAttachment")}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.cardRow(curLang)}>
                <Text>{i18n.t("status")} {" : "}</Text>
                <Text>{item.STATUS}</Text>
              </View>
            </View>
          )
          }
        />
        < Button mode="contained" style={{ borderRadius: 0 }
        } onPress={() => setShowMyRequestsModal(false)}>
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button >
      </Modal >
    );
  };

  const renderFiltersModal = () => {
    return (
      <Modal
        visible={true}
        onDismiss={() => {
          setShowFiltersModal(false)
        }}
        contentContainerStyle={styles.modalStyle2}
      >
        <Text style={styles.modalTitle}>{i18n.t("filters")} </Text>
        <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
          <TextInput
            label={i18n.t("fromDate")}
            value={moment(fromDate).format("DD/MM/YYYY")}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showFromDatePicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={onFromDateChange}
          />
        )}
        <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
          <TextInput
            label={i18n.t("toDate")}
            value={moment(toDate).format("DD/MM/YYYY")}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showToDatePicker && (
          <DateTimePicker
            value={toDate}
            minimumDate={fromDate}
            mode="date"
            display="default"
            onChange={onToDateChange}
          />
        )}
        {filtersCaller == "MyRequests" && (
          <View>
            <View style={{ marginVertical: 10 }}>
              <TouchableOpacity
                onPress={() => setRequestStatus("Done")}
                style={styles.radioButton}
              >
                <Ionicons
                  name={requestStatus === "Done" ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={Constants2.appColor}
                />
                <Text style={{ marginLeft: 8 }}>{i18n.t("visitDone")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRequestStatus("Pending")}
                style={styles.radioButton}
              >
                <Ionicons
                  name={requestStatus === "Pending" ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={Constants2.appColor}
                />
                <Text style={{ marginLeft: 8 }}>{i18n.t("pending")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRequestStatus("")}
                style={styles.radioButton}
              >
                <Ionicons
                  name={requestStatus === "" ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={Constants2.appColor}
                />
                <Text style={{ marginLeft: 8 }}>{i18n.t("all")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row" }}>
          <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => setShowFiltersModal(false)}>
            <Text style={styles.text}>{i18n.t("back")}</Text>
          </Button>
          <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={async () => {
            setProggressDialogVisible(true);
            if (filtersCaller == "PendingRequests") {
              setPendingRequests([]);
              setFilteredPendingRequests([]);
              const pendingReqs = await ServerOperations.getPendingRequests(curUser, moment(fromDate).format("DD/MM/YYYY"), moment(toDate).format("DD/MM/YYYY"));
              if (pendingReqs != null && pendingReqs != "" && pendingReqs != undefined) {
                setPendingRequests(pendingReqs);
                setFilteredPendingRequests(pendingReqs);
              }
              setShowPendingRequestsModal(true)
            }
            if (filtersCaller == "PendingVisits") {
              setPendingActions([]);
              setFilteredPendingActions([]);
              const pendingActs = await ServerOperations.getPendingActions(curUser, moment(fromDate).format("DD/MM/YYYY"), moment(toDate).format("DD/MM/YYYY"));
              if (pendingActs != null && pendingActs != "" && pendingActs != undefined) {
                setPendingActions(pendingActs);
                setFilteredPendingActions(pendingActs);
              }
              setShowPendingVisitsModal(true)
            }
            if (filtersCaller == "MyRequests") {
              setMyRequests([]);
              setFilteredMyRequests([]);
              const myReqs = await ServerOperations.getMyRequests(curUser, moment(fromDate).format("DD/MM/YYYY"), moment(toDate).format("DD/MM/YYYY"), requestStatus);
              if (myReqs != null && myReqs != "" && myReqs != undefined) {
                setMyRequests(myReqs);
                setFilteredMyRequests(myReqs);
              }
              setShowMyRequestsModal(true)
            }
            setProggressDialogVisible(false);
            setShowFiltersModal(false);
          }
          }>
            <Text style={styles.text}>{i18n.t("search")}</Text>
          </Button>
        </View>
      </Modal >
    );
  }

  // Load maintenance users
  const loadMaintenanceUsers = async () => {
    try {
      setProggressDialogVisible(true);
      const currentUser = await Commons.getFromAS("userID");
      const users = await ServerOperations.getMaintenanceUsers(currentUser);
      if (users != null && users != "" && users != undefined) {
        setMaintenanceUsers(users);
      }
    } catch (error) {
      console.error("Error loading maintenance users:", error);
      Alert.alert("Error", "Failed to load maintenance users");
    } finally {
      setProggressDialogVisible(false);
    }
  };

  // Handle maintenance user selection
  const handleMaintenanceUserSelection = async (user) => {
    try {
      setProggressDialogVisible(true);
      setSelectedMaintenanceUser(user.id);
      setSelectedMaintenanceUserName(user.name);
      setShowMaintenanceUsersModal(false);

      // Load route customers for the selected maintenance user
      let custlist = [];
      if (customerType === "Existing") {
        custlist = await ServerOperations.getRouteCustomers(user.id);
        if (custlist != null && custlist != "" && custlist != undefined) {
          setCustomersList(custlist);
          setFilteredCustomersList(custlist);
        }
      } else if (customerType === "Potential") {
        const potCustlist = await ServerOperations.getRoutePotentialCustomers(user.id);
        setPotentialCustomersList(potCustlist);
        setFilteredPotentialCustomersList(potCustlist);
      }

      setProggressDialogVisible(false);
      setShowSelectCustomerModal(true);
    } catch (error) {
      console.error("Error loading maintenance user customers:", error);
      Alert.alert("Error", "Failed to load customers for selected user");
      setProggressDialogVisible(false);
    }
  };

  const handleDialogChoice = async (choice) => {
    if (choice === "maintenanceUser") {
      // Show maintenance users modal
      setDialogVisible(false);
      await loadMaintenanceUsers();
      setShowMaintenanceUsersModal(true);
      return;
    }

    setProggressDialogVisible(true);
    setDialogVisible(false);
    const currentUser = await Commons.getFromAS("userID");

    if (customerType === "Existing") {
      // Handle existing customers (original logic)
      let custlist = [];
      if (choice === "onRoute") {
        custlist = await ServerOperations.getRouteCustomers(currentUser);
      } else if (choice === "default") {
        if (empType == "Salesman") {
          custlist = await ServerOperations.getCustomers(currentUser);
        } else {
          custlist = await ServerOperations.getCustomers("");
        }
      }
      if (custlist != null && custlist != "" && custlist != undefined) {
        setCustomersList(custlist);
        setFilteredCustomersList(custlist);
      }
    } else if (customerType === "Potential") {
      // Handle potential customers
      let potCustlist = [];
      if (choice === "onRoute") {
        potCustlist = await ServerOperations.getRoutePotentialCustomers(currentUser);
      } else if (choice === "default") {
        potCustlist = await ServerOperations.getPotentialCustomers(currentUser);
      }
      //if (potCustlist != null && potCustlist != "" && potCustlist != undefined) {
      setPotentialCustomersList(potCustlist);
      setFilteredPotentialCustomersList(potCustlist);
      // }
    }

    setProggressDialogVisible(false);
    setShowSelectCustomerModal(true);
  };

  // Add route customers modal:
  const renderRouteCustomersModal = () => {
    return (
      <Modal
        visible={showRouteCustomersModal}
        onDismiss={() => {
          setSearchText(""); // Clear search when modal closes
          setShowRouteCustomersModal(false);
        }}
        contentContainerStyle={styles.modalStyle}
      >
        <TextInput
          placeholder={i18n.t("search")}
          clearButtonMode="always"
          style={styles.inputBox}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (routeCustomerType === "Existing") {
              const list = Commons.handleSearch(text, customersList);
              setFilteredRouteCustomers(list);
            } else {
              const list = Commons.handleSearch(text, potentialCustomersList);
              setFilteredRoutePotentialCustomers(list);
            }
          }}
        />

        {/* Customer Type Tabs */}
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <TouchableOpacity
            onPress={() => {
              setRouteCustomerType("Existing");
              setSearchText("");
              setFilteredRouteCustomers(customersList);
            }}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: routeCustomerType === "Existing" ? Constants2.appColor : "#f0f0f0",
              borderRadius: 5,
              marginRight: 5
            }}
          >
            <Text style={{
              textAlign: "center",
              color: routeCustomerType === "Existing" ? "white" : "black",
              fontWeight: "bold"
            }}>
              {i18n.t("customers")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setRouteCustomerType("Potential");
              setSearchText("");
              setFilteredRoutePotentialCustomers(potentialCustomersList);
            }}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: routeCustomerType === "Potential" ? Constants2.appColor : "#f0f0f0",
              borderRadius: 5,
              marginLeft: 5
            }}
          >
            <Text style={{
              textAlign: "center",
              color: routeCustomerType === "Potential" ? "white" : "black",
              fontWeight: "bold"
            }}>
              {i18n.t("potentialCustomers")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.modalTitle}>
          {routeCustomerType === "Existing" ? i18n.t("selectCustomers") : i18n.t("selectPotentialCustomers")}
        </Text>

        <FlatList
          keyExtractor={(item) => item.CODE}
          data={routeCustomerType === "Existing" ? filteredRouteCustomers : filteredRoutePotentialCustomers}
          renderItem={({ item }) => {
            const isSelected = routeCustomerType === "Existing"
              ? (routeCustomers || []).some(customer => customer.CODE === item.CODE)
              : (routePotentialCustomers || []).some(customer => customer.CODE === item.CODE);
            return (
              <TouchableOpacity
                onPress={() => {
                  if (routeCustomerType === "Existing") {
                    if (isSelected) {
                      // Remove customer
                      setRouteCustomers((routeCustomers || []).filter(customer => customer.CODE !== item.CODE));
                    } else {
                      // Add customer
                      setRouteCustomers([...(routeCustomers || []), item]);
                    }
                  } else {
                    if (isSelected) {
                      // Remove potential customer
                      setRoutePotentialCustomers((routePotentialCustomers || []).filter(customer => customer.CODE !== item.CODE));
                    } else {
                      // Add potential customer
                      setRoutePotentialCustomers([...(routePotentialCustomers || []), item]);
                    }
                  }
                }}
                style={{
                  padding: 15,
                  borderWidth: 0.5,
                  borderRadius: 5,
                  marginBottom: 5,
                  backgroundColor: isSelected ? '#e3f2fd' : 'white'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                    size={24}
                    color={isSelected ? Constants2.appColor : "gray"}
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text style={{ color: "red", fontWeight: "bold" }}>{item.CODE}</Text>
                    <Text>{item.NAME}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => {
          setSearchText(""); // Clear search when closing modal
          setShowRouteCustomersModal(false);
        }}>
          <Text style={styles.text}>{i18n.t("back")}</Text>
        </Button>
      </Modal>
    );
  };

  // Add define route modal:
  const renderDefineRouteModal = () => {
    return (
      <Modal
        visible={showDefineRouteModal}
        onDismiss={() => setShowDefineRouteModal(false)}
        contentContainerStyle={styles.modalStyle2}
      >
        <Text style={styles.modalTitle}>{i18n.t("defineRoute")}</Text>

        <TouchableOpacity onPress={() => setShowRouteDatePicker(true)}>
          <TextInput
            label={i18n.t("selectDate")}
            value={moment(routeDate).format("DD/MM/YYYY")}
            disabled={true}
            style={styles.inputBox}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {showRouteDatePicker && (
          <DateTimePicker
            value={routeDate}
            mode="date"
            display="default"
            onChange={onRouteDateChange}
          />
        )}

        <TouchableOpacity
          style={{
            flexDirection: curLang == "ar" ? 'row' : 'row-reverse',
            marginVertical: 10,
            justifyContent: "space-between",
            backgroundColor: Constants2.appColor,
            padding: 10,
            width: "100%",
            borderRadius: 5
          }}
          onPress={() => {
            setSearchText(""); // Clear search when opening modal
            setRouteCustomerType("Existing"); // Set default to existing customers
            setFilteredRouteCustomers(customersList);
            setFilteredRoutePotentialCustomers(potentialCustomersList);
            setShowRouteCustomersModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={26} color="white" />
          <Text style={{ textAlign: "flex-end", fontSize: 16, color: "white", fontWeight: "bold" }}>
            {i18n.t("addCustomers")}
          </Text>
        </TouchableOpacity>

        {/* Display selected customers */}
        {((routeCustomers || []).length > 0 || (routePotentialCustomers || []).length > 0) && (
          <View style={{ marginBottom: 10 }}>
            {(routeCustomers || []).length > 0 && (
              <View>
                <Text style={{ fontSize: 14, fontWeight: "bold", marginVertical: 5, color: Constants2.appColor }}>
                  {i18n.t("customers")} ({(routeCustomers || []).length})
                </Text>
                <FlatList
                  keyExtractor={(item) => `existing_${item.CODE}`}
                  data={routeCustomers || []}
                  style={{ maxHeight: 100, marginBottom: 5 }}
                  renderItem={({ item }) => (
                    <View style={{
                      padding: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <View>
                        <Text style={{ color: "red", fontWeight: "bold", fontSize: 12 }}>{item.CODE}</Text>
                        <Text style={{ fontSize: 12 }}>{item.NAME}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setRouteCustomers((routeCustomers || []).filter(customer => customer.CODE !== item.CODE));
                        }}
                      >
                        <Ionicons name="trash" size={16} color="red" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}

            {(routePotentialCustomers || []).length > 0 && (
              <View>
                <Text style={{ fontSize: 14, fontWeight: "bold", marginVertical: 5, color: Constants2.appColor }}>
                  {i18n.t("potentialCustomers")} ({(routePotentialCustomers || []).length})
                </Text>
                <FlatList
                  keyExtractor={(item) => `potential_${item.CODE}`}
                  data={routePotentialCustomers || []}
                  style={{ maxHeight: 100, marginBottom: 5 }}
                  renderItem={({ item }) => (
                    <View style={{
                      padding: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <View>
                        <Text style={{ color: "blue", fontWeight: "bold", fontSize: 12 }}>{item.CODE}</Text>
                        <Text style={{ fontSize: 12 }}>{item.NAME}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setRoutePotentialCustomers((routePotentialCustomers || []).filter(customer => customer.CODE !== item.CODE));
                        }}
                      >
                        <Ionicons name="trash" size={16} color="red" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        )}

        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <Button
            mode="contained"
            style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }}
            onPress={() => {
              setShowDefineRouteModal(false);
              setRouteCustomers([]);
              setRoutePotentialCustomers([]);
              setRouteDate(new Date());
            }}
          >
            <Text style={styles.text}>{i18n.t("cancel")}</Text>
          </Button>
          <Button
            mode="contained"
            style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }}
            onPress={async () => {
              if ((routeCustomers || []).length === 0 && (routePotentialCustomers || []).length === 0) {
                Commons.okAlert(i18n.t("error"), i18n.t("pleaseSelectAtLeastOneCustomer"));
                return;
              }
              setProggressDialogVisible(true);

              // Prepare separate customer code lists
              const existingCustomerCodes = (routeCustomers || []).map(customer => customer.CODE).join(";;");
              const potentialCustomerCodes = (routePotentialCustomers || []).map(customer => customer.CODE).join(";;");

              console.log("Existing customer codes:", existingCustomerCodes);
              console.log("Potential customer codes:", potentialCustomerCodes);

              const result = await ServerOperations.saveRouteCustomers(
                curUser,
                moment(routeDate).format("DD/MM/YYYY"),
                existingCustomerCodes,
                potentialCustomerCodes
              );
              if (result.res) {
                Commons.okAlert(i18n.t("success"), i18n.t("routeSavedSuccessfully"));
                setShowDefineRouteModal(false);
                setRouteCustomers([]);
                setRoutePotentialCustomers([]);
                setRouteDate(new Date());
              }
              setProggressDialogVisible(false);
            }}
          >
            <Text style={styles.text}>{i18n.t("save")}</Text>
          </Button>
        </View>
      </Modal>
    );
  };

  // Render maintenance users modal
  const renderMaintenanceUsersModal = () => {
    return (
      <Modal
        visible={showMaintenanceUsersModal}
        onDismiss={() => setShowMaintenanceUsersModal(false)}
        contentContainerStyle={styles.modalStyle}
      >
        <Text style={styles.modalTitle}>
          {i18n.t("selectMaintenanceUser")}
        </Text>
        <FlatList
          keyExtractor={(item) => item.id}
          data={maintenanceUsers}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleMaintenanceUserSelection(item)}
              style={{
                padding: 15,
                borderWidth: 0.5,
                borderRadius: 5,
                marginBottom: 5,
                backgroundColor: "#f9f9f9"
              }}
            >
              <Text style={{ fontWeight: "bold", color: "red" }}>{item.id}</Text>
              <Text style={{ marginTop: 5 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
        <Button
          mode="contained"
          style={{ borderRadius: 0, marginTop: 10 }}
          onPress={() => setShowMaintenanceUsersModal(false)}
        >
          <Text style={styles.text}>{i18n.t("cancel")}</Text>
        </Button>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.view} >
      {/* <Image style={styles.image} source={require("../../assets/logo.png")} /> */}
      <Portal>
        <ProgressDialog visible={progressDialogVisible} />
      </Portal>
      <Portal>{showMyVisitsFiltersModal && renderMyVisitsFiltersModal()}</Portal>
      <Portal>{showRemindersFiltersModal && renderRemindersFiltersModal()}</Portal>
      {/* <Portal>{showPendingVisitsFiltersModal && renderPendingVisitsFiltersModal()}</Portal> */}
      <Portal>{showPendingVisitsModal && renderPendingVisitsModal()}</Portal>
      {/* <Portal>{showPendingRequestsFiltersModal && renderPendingRequestsFiltersModal()}</Portal> */}
      <Portal>{showPendingRequestsModal && renderPendingRequestsModal()}</Portal>
      <Portal>{showMyRequestsModal && renderMyRequestsModal()}</Portal>
      <Portal>{showSelectCustomerModal && renderSelectCustomerModal()}</Portal>
      <Portal>{showFiltersModal && renderFiltersModal()}</Portal>
      <Portal>{showBranchModal && renderBranchModal()}</Portal>
      <Portal>{showAssignVisitModal && renderAssignVisitModal()}</Portal>
      <Portal>{showSalesmanModal && renderSalesmanModal()}</Portal>
      <Portal>{showAssignCustomerModal && renderAssignCustomerModal()}</Portal>
      <Portal>{showAssignedBranchModal && renderAssignedBranchModal()}</Portal>
      <Portal>{showDefineRouteModal && renderDefineRouteModal()}</Portal>
      <Portal>{showRouteCustomersModal && renderRouteCustomersModal()}</Portal>
      <Portal>{showMaintenanceUsersModal && renderMaintenanceUsersModal()}</Portal>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{i18n.t("selectCustomerListToShow")}</Dialog.Title>

          <Dialog.Content>
            <View>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleDialogChoice("onRoute")}
              >
                <Ionicons name="map-outline" size={22} color={Constants2.appColor} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>{i18n.t("onRouteCustomers")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleDialogChoice("default")}
              >
                <Ionicons name="people-outline" size={22} color={Constants2.appColor} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>{i18n.t("allCustomers")}</Text>
              </TouchableOpacity>

              {empType === "Maintenance" && (
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => handleDialogChoice("maintenanceUser")}
                >
                  <Ionicons name="swap-horizontal-outline" size={22} color={Constants2.appColor} style={styles.optionIcon} />
                  <Text style={styles.optionLabel}>{i18n.t("chooseAnotherEmpRoute")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={() => setDialogVisible(false)}>{i18n.t("cancel")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <ScrollView contentContainerStyle={styles.container}>
        {/* First Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={async () => {
              setCustomerType("Existing")
              setModalCaller("NewVisit");
              setSelectedPendingVisitId("");
              setShowSelectCustomerModal(false);
              setShowSelectCustomerModal(false);
              // Kick off location prewarm so NewVisit screen gets faster first fix
              prewarmLocation();
              setTimeout(() => {
                setDialogVisible(true);
              }, 100);
            }}
            style={styles.appButtonContainer(curLang)}
          >
            <Ionicons name="add-circle" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
            <Text style={styles.appButtonText}>
              {i18n.t("newVisit")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              setCustomerType("");
              setSelectedCustomer("");
              setSelectedCustomerName("")
              setSelectedCustomerPhone("")
              setFromDate(new Date());
              setToDate(new Date());
              setShowMyVisitsFiltersModal(true);
            }}
            style={styles.appButtonContainer(curLang)}
          >
            <Ionicons name="document-text" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
            <Text style={styles.appButtonText}>
              {i18n.t("myVisits")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Second Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={async () => {
              setFromDate(new Date());
              setToDate(new Date());
              setShowFiltersModal(true);
              setFiltersCaller("MyRequests");
            }}
            style={styles.appButtonContainer(curLang)}
          >
            <Ionicons name="document-text" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
            <Text style={styles.appButtonText}>
              {i18n.t("myRequests")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              setFromDate(new Date());
              setToDate(new Date());
              setShowFiltersModal(true);
              setFiltersCaller("PendingVisits");
            }}
            style={styles.appButtonContainer(curLang)}
          >
            <Ionicons name="calendar" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
            <Text style={styles.appButtonText}>
              {i18n.t("pendingVisits")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Third Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={async () => {
              setFromDate(new Date());
              setToDate(new Date());
              setShowFiltersModal(true);
              setFiltersCaller("PendingRequests");
            }}
            style={styles.appButtonContainer(curLang)}
          >
            <Ionicons name="calendar" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
            <Text style={styles.appButtonText}>
              {i18n.t("pendingRequests")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              setShowDefineRouteModal(true);
              // Load route customers when modal opens
              await loadRouteCustomers();
            }}
            style={styles.appButtonContainer(curLang)}
          >
            <Ionicons name="map" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
            <Text style={styles.appButtonText}>
              {i18n.t("defineRoutes")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Salesman-specific buttons */}
        {empType == "Salesman" && (
          <>
            {/* Fourth Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={async () => {
                  setCustomerType("Potential");
                  setModalCaller("NewVisit");
                  setSelectedPendingVisitId("");
                  setShowSelectCustomerModal(false);
                  setShowSelectCustomerModal(false);
                  // Kick off location prewarm for new potential customer visit
                  prewarmLocation();
                  setTimeout(() => {
                    setDialogVisible(true);
                  }, 100);
                }}
                style={styles.appButtonContainer(curLang)}
              >
                <Ionicons name="add-circle" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
                <Text style={styles.appButtonText}>
                  {i18n.t("newCustomerVisit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  setCustomerType("Potential");
                  setModalCaller("MyPotentialCustomers");
                  setSelectedPendingVisitId("");
                  setShowSelectCustomerModal(true);
                }}
                style={styles.appButtonContainer(curLang)}
              >
                <Ionicons name="document-text" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
                <Text style={styles.appButtonText}>
                  {i18n.t("myPotentialCustomers")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fifth Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={async () => {
                  navigation.navigate("NewCustomerPotential", { custID: "" });
                }}
                style={styles.appButtonContainer(curLang)}
              >
                <Ionicons name="add-circle" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
                <Text style={styles.appButtonText}>
                  {i18n.t("newCustomerPotential")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await loadSalesmen();
                  setShowAssignVisitModal(true);
                }}
                style={styles.appButtonContainer(curLang)}
              >
                <Ionicons name="person-add" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
                <Text style={styles.appButtonText}>
                  {i18n.t("assignVisit")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Reminders row - placed after all other buttons (inside scrollable area) */}
        <View style={[styles.buttonRow, { marginTop: 8, marginBottom: 8, justifyContent: 'center', width: '45%' }]}>
          <TouchableOpacity
            onPress={async () => {
              setFromDate(new Date());
              setToDate(new Date());
              setShowRemindersFiltersModal(true);
            }}
            style={[styles.appButtonContainer(curLang), { alignSelf: 'center' }]}
          >
            <Ionicons name="notifications" style={{ marginHorizontal: 6 }} size={22} color={Constants2.appColor} />
            <Text style={styles.appButtonText}>
              {i18n.t("reminders")}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={{ backgroundColor: Constants2.appColor, width: "100%", height: height / 10, flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={clearStorage}
          style={{
            flexDirection: curLang == "ar" ? "row-reverse" : "row",
            padding: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: Color.WHITE,
            alignItems: "center"
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "white", marginHorizontal: 5 }}>
            {i18n.t("logout")}
          </Text>
          <Ionicons color="white" size={24} name="log-out" />
        </TouchableOpacity>
        <Text style={{ color: "white", alignSelf: "center" }}>
          {Constants2.appVersion}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            const newLang = i18n.t("changeLang");
            await actions.switchLanguage(newLang);

            // Update local language state immediately
            const updatedLang = await Commons.getFromAS("lang");
            setCurLang(updatedLang);

            // Force re-render by toggling refresh state
            setRefresh(prevRefresh => !prevRefresh);

            // Optional: Show a brief message that language changed
            console.log(`Language switched to: ${updatedLang}`);
          }}
          style={{
            flexDirection: curLang == "ar" ? "row-reverse" : "row",
            padding: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: Color.WHITE,
            alignItems: "center"
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "white", marginHorizontal: 5 }}>
            {i18n.t("changeLang")}
          </Text>
          <Ionicons color="white" size={24} name="language" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  datetimepickerstyle: {
    alignSelf: "center",
    width: 100,
    padding: 15,
  },
  text: { color: "white", fontWeight: "bold", fontSize: 16 },
  text3: { color: Constants2.darkBlueColor, fontWeight: "bold" },
  mainPicker: {
    height: Platform.OS === "ios" ? 150 : 50,
    marginTop: Platform.OS === "ios" ? -75 : 0,
    width: 160,
    marginRight: Platform.OS === "ios" ? "70%" : "30%",
  },
  locPicker: {
    height: Platform.OS === "ios" ? 150 : 50,
    marginTop: Platform.OS === "ios" ? -95 : -15,
    margin: 25,
    flex: 2,
    width: 300,
    marginRight: "10%",
  },
  typePicker: {
    height: Platform.OS === "ios" ? 150 : 50,
    paddingVertical: Platform.OS === "ios" ? 0 : 8,
    textAlignVertical: "center",
    marginTop: Platform.OS === "ios" ? -50 : -5,
    marginBottom: Platform.OS === "ios" ? 40 : 25,
    margin: 25,
    flex: 2,
    width: 300,
    marginRight: "10%",
  },
  typePicker2: {
    height: Platform.OS === "ios" ? 150 : 50,
    marginTop: Platform.OS === "ios" ? -55 : -15,
    marginBottom: Platform.OS === "ios" ? 40 : 25,
    alignSelf: "center",
    margin: 25,
    width: 300,
    marginRight: "10%",
  },
  inputBox: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    textAlign: "center"
  },
  searchBox: {
    borderColor: "#ccc",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#ececec"
  },
  dateTimeTexts: {
    fontSize: 18,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  dateTimeButtons: {
    borderColor: "rgb(1,135,134)",
  },
  modalStyle: {
    backgroundColor: "white",
    padding: 20,
    height: "95%",
  },
  taskItemView: curLang => ({
    flexDirection: curLang == "ar" ? "row-reverse" : "row",
    marginHorizontal: 10,
    marginVertical: 5,
  }),
  modalStyle2: {
    backgroundColor: "white",
    padding: 20,
  },
  view: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  appButtonContainer: curLang => ({
    width: '45%',
    margin: 4,
    marginBottom: 12,
    backgroundColor: Color.GREY[50],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Color.GREY[500],
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: White,
    flexDirection: curLang == "ar" ? "row-reverse" : "row",
    flex: 1,
    minHeight: 50,
  }),
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 8,
  },
  container: {
    backgroundColor: Color.GREY[100],
    alignItems: 'center',
    paddingTop: 80,
    minHeight: height - height / 10
  },
  dropdownContainer: {
    width: width / 1.7,  // Added width to match dropdown
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dropdownStyle: {
    width: width / 2,  // Changed from width / 2.5
    borderColor: '#ccc',
    borderWidth: 1,
  },
  appButtonText: {
    fontSize: 12,
    marginHorizontal: 2,
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  appButton: {
    margin: 20,
  },
  text2: curLang => ({
    fontWeight: "bold",
    fontSize: 16,
    alignSelf: "center",
    minWidth: width / 3.3,  // Add fixed minimum width for text
    textAlign: curLang == "ar" ? "right" : "left"
  }),
  image: {
    width: 150,
    height: 155,
    marginBottom: 20,
    alignSelf: "center",
    marginTop: -75,
  },
  image2: {
    width: 350,
    height: 285,
    alignSelf: "center",
  },
  cardTitle: { color: "red", alignSelf: 'center', fontWeight: "bold", marginBottom: 10 },
  cardRow: curLang => ({ flexDirection: curLang == "ar" ? "row-reverse" : "row", marginBottom: 10 }),
  radioButton: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  branchItem: {
    padding: 15,
    borderWidth: 0.5,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: 'white'
  },
  branchText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  addressText: {
    color: 'gray'
  },
  modalTitle: { textAlign: "center", fontSize: 16, backgroundColor: Constants2.appColor, color: "white", fontWeight: "bold", padding: 10, width: "100%" }
});

//export default MainScreen;
