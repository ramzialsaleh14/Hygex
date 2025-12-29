import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Modal, Portal, TextInput, RadioButton } from "react-native-paper";
import * as ServerOperations from "../utils/ServerOperations";
import * as DocumentPicker from "expo-document-picker";
import * as Commons from "../utils/Commons";
import * as SecureStore from "expo-secure-store";
import { loginTheme } from "../../App.style";
import * as Constants from "../utils/Constants";
import * as Localization from "expo-localization";
import { Ionicons } from "@expo/vector-icons";
import Color, { White } from 'react-native-material-color';
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { Camera, CameraType, useCameraPermissions, CameraView } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import AttachmentPicker from '../components/AttachmentPicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Text,
    FlatList,
    Alert,
    Platform,
    Linking,
    PermissionsAndroid,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView
} from "react-native";
import i18n from "../languages/langStrings";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import Capture from "../components/Capture";
import * as ImagePicker from 'expo-image-picker';
import { height, width } from "../utils/Styles";
import * as SQLite from "expo-sqlite";
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomerContacts from '../components/CustomerContacts';
import ProgressDialog from "../components/ProgressDialog";


TouchableOpacity.defaultProps = { activeOpacity: 0.8 };

const AppButton = ({ onPress, title }) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);

export const NewVisitScreen = ({ route, navigation }) => {
    //**Variables**//
    const [singleFile, setSingleFile] = useState("");
    const [searchText, setSearchText] = useState("");
    const [curLang, setCurLang] = useState("");
    const [curUser, setCurUser] = useState("");
    const [imageType, setImageType] = useState('');
    const [inTime, setInTime] = useState("");
    const [outTime, setOutTime] = useState("");
    const [cameraPermission, setCameraPermission] = useCameraPermissions();
    const [camera, setCamera] = useState(null);
    const [visitID, setVisitID] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedVisitType, setSelectedVisitType] = useState("Periodic");
    const [selectedCust, setSelectedCust] = useState("");
    const [selectedCustName, setSelectedCustName] = useState("");
    const [selectedCustPhone, setSelectedCustPhone] = useState("");
    const [selectedCustBranch, setSelectedCustBranch] = useState("");
    const [selectedCustBusinessType, setSelectedCustBusinessType] = useState("");
    const [currentPhoneNumber, setCurrentPhoneNumber] = useState(null);
    const [empType, setEmpType] = useState("");
    const [showAddDepartmentDialog, setShowAddDepartmentDialog] = useState(false);
    const [showAddReqDepartmentDialog, setShowAddReqDepartmentDialog] = useState(false);
    const [showAddActionModal, setShowActionModal] = useState(false);
    const [actionsLoading, setActionsLoading] = useState(false);
    const [filteredDepartmentsList, setFilteredDepartmentsList] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [actionsList, setActionsList] = useState([]);
    const [checkedActionsList, setCheckedActionsList] = useState([]);
    const [addedDepartmentsList, setAddedDepartmentsList] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedDepartmentEnDesc, setSelectedDepartmentEnDesc] = useState("");
    const [selectedDepartmentArDesc, setSelectedDepartmentArDesc] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedAction, setSelectedAction] = useState("");
    //  const [imagePreviewVisible, setImagePreviewVisible] = useState(false); // State for image preview
    const [imageUri, setImageUri] = useState(null); // State to hold the image URI for preview
    const [selectedRequest, setSelectedRequest] = useState("");
    const [selectedRequestDesc, setSelectedRequestDesc] = useState("");
    const [selectedRequestHint, setSelectedRequestHint] = useState("");
    const [selectedRequestNotesRequired, setSelectedRequestNotesRequired] = useState("");
    const [showReqActionModal, setShowReqActionModal] = useState(false);
    const [showReqDetailsModal, setShowReqDetailsModal] = useState(false);
    const [checkedRequestsList, setCheckedRequestsList] = useState([]);
    const [requestsList, setRequestsList] = useState([]);
    const [filteredRequestsList, setFilteredRequestsList] = useState([]);
    const [addedRequestsList, setAddedRequestsList] = useState([]);
    const [reqDetailsAttachment, setReqDetailsAttachment] = useState("");
    const [reqDetailsNotes, setReqDetailsNotes] = useState("");
    const [reqDetailsDepartments, setReqDetailsDepartments] = useState([]);
    const [reqDetailsEquipments, setReqDetailsEquipments] = useState([]);
    const [showReqEquipmentsModal, setShowReqEquipmentsModal] = useState(false);
    const [selectedReqEquipments, setSelectedReqEquipments] = useState([]);
    const [contactsList, setContactsList] = useState([]);
    const [equipmentsList, setEquipmentsList] = useState([]);
    const [defaultEquipmentsList, setDefaultEquipmentsList] = useState([]);
    const [filteredEquipmentsList, setFilteredEquipmentsList] = useState([]);
    const [customerEquipmentsList, setCustomerEquipmentsList] = useState([{ "EQ_NO": "", "EN_DESC": "", "AR_DESC": "", "QTY": "" }]);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [showEquipmentsModal, setShowEquipmentsModal] = useState(false);
    const [showCustomerEquipmentsModal, setShowCustomerEquipmentsModal] = useState(false);
    const [selectedEquipments, setSelectedEquipments] = useState([]);
    const [customerVisits, setCustomerVisits] = useState([]);
    const [filteredCustomerVisits, setFilteredCustomerVisits] = useState([]);
    const [showCustomerVisitsModal, setShowCustomerVisitsModal] = useState(false);
    const [callStartTime, setCallStartTime] = useState(null);
    const [callDuration, setCallDuration] = useState(null);
    const [callEnded, setCallEnded] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [ignoreLoc, setIgnoreLoc] = useState(false);
    const [startLocation, setStartLocation] = useState("");
    const [visitStartTime, setVisitStartTime] = useState("");
    const [selectedDepartmentLocation, setSelectedDepartmentLocation] = useState("");
    const [customerLocation, setCustomerLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [pendingVisitId, setPendingVisitId] = useState("");
    const [pendingReqId, setPendingReqId] = useState("");
    const [businessTypesList, setBusinessTypesList] = useState([]);
    const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
    const [visitCallOpen, setVisitCallOpen] = useState(false);
    const [visitTypeOpen, setVisitTypeOpen] = useState(false);
    const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
    const [isHygex, setIsHygex] = useState(false);
    const [isNotesVisit, setIsNotesVisit] = useState(false);
    const [visitNotes, setVisitNotes] = useState("");
    const [visitAttachments, setVisitAttachments] = useState([]);

    const [visitCallItems, setVisitCallItems] = useState([
        { label: i18n.t("chooseAction"), value: "", disabled: true },
        { label: i18n.t("visit"), value: "Visit" },
        { label: i18n.t("call"), value: "Call" },
        { label: i18n.t("addRequest"), value: "Request" },
        { label: i18n.t("priceOffer"), value: "Price Offer" },
    ]);

    const [visitTypeItems, setVisitTypeItems] = useState([
        { label: i18n.t("periodic"), value: "Periodic" },
        { label: i18n.t("urgent"), value: "Urgent" }
    ]);

    useEffect(() => {
        if (visitCallOpen) {
            setVisitTypeOpen(false);
            setBusinessTypeOpen(false);
        }
    }, [visitCallOpen]);

    useEffect(() => {
        if (visitTypeOpen) {
            setVisitCallOpen(false);
            setBusinessTypeOpen(false);
        }
    }, [visitTypeOpen]);

    useEffect(() => {
        if (businessTypeOpen) {
            setVisitCallOpen(false);
            setVisitTypeOpen(false);
        }
    }, [businessTypeOpen]);

    // Small helper to wait between attempts
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    // Haversine distance for outlier filtering
    const distanceMeters = (a, b) => {
        const toRad = d => (d * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(b.latitude - a.latitude);
        const dLon = toRad(b.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const s = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
        return 2 * R * Math.asin(Math.sqrt(s));
    };


    // Pre-warm background attempt on mount (non-blocking)
    //useEffect(() => { let cancelled = false; (async () => { try { await acquireStableLocation({ maxTotalMs: 5000, desiredAccuracyMeters: 500 }); } catch (_) { } if (cancelled) return; })(); return () => { cancelled = true; }; }, []);

    async function getCurrentLocation(retries = 5) {
        console.log(selectedType)
        if (selectedType !== "Visit" && selectedType !== "") {
            return null;
        }

        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
        try {
            const geolocation = await Promise.race([
                Location.getCurrentPositionAsync({
                    enableHighAccuracy: true,
                    accuracy: Location.Accuracy.Balanced,
                }),
                timeout,
            ]);

            if (geolocation && geolocation.coords) {
                const { latitude, longitude, accuracy } = geolocation.coords;

                const loc = `${latitude},${longitude}`;
                console.log('Current position:', loc, 'accuracy(m):', accuracy);
                return loc;
            } else {
                throw new Error('Invalid position data');
            }
        } catch (error) {
            if (error.message === 'Timeout' && retries > 0) {
                console.log('Timeout occurred, retrying getCurrentPositionAsync');
                await new Promise(r => setTimeout(r, 1000));
                return await getCurrentLocation(retries - 1);
            }
            console.log('getCurrentLocation error', error);

            if (error.message.includes('permission')) {
                Alert.alert(i18n.t("error"), i18n.t("locationPermissionDenied"));
            } else if (error.message.includes('timeout') || error.message === 'Timeout') {
                Alert.alert(i18n.t("error"), i18n.t("locationUnavailable") + " - " + i18n.t("timeout"));
            } else {
                Alert.alert(i18n.t("error"), i18n.t("locationUnavailable"));
            }
            return null;
        }
    }

    // Separate function for location fetching with its own loading state
    const getCurrentLocationWithLoading = async () => {
        setLoading(true);
        setLoadingMessage(i18n.t("fetchingLocation"));

        try {
            const result = await getCurrentLocation();
            return result;
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    }

    useEffect(() => {
        (async () => {
            if (selectedType == "Visit") {
                if (startLocation == "" || startLocation == undefined || startLocation == null) {
                    // Try up to 2 times to avoid empty startLocation
                    for (let i = 0; i < 2; i++) {
                        const loc = await getCurrentLocationWithLoading();
                        if (loc) {
                            setStartLocation(loc);
                            console.log('Start location set:', loc);
                            break;
                        }
                        // small pause before another attempt
                        await delay(1200);
                    }
                }
            }
            // Only set visitStartTime to current time if it wasn't loaded from visit details
            if ((visitStartTime == "" || visitStartTime == undefined || visitStartTime == null) && (route.params.visitID == "" || route.params.visitID == undefined)) {
                const result = await ServerOperations.getServerTime();
                setVisitStartTime(result.res);
            }
        })();
    }, [selectedType]);

    useEffect(() => {
        (async () => {
            console.log('=== Starting main useEffect ===');
            setLoading(true);
            setLoadingMessage(i18n.t('loadingGettingUser'));
            console.log('1. Getting current language and user...');
            const curLang = await Commons.getFromAS("lang");
            console.log(curLang);
            const curUser = await Commons.getFromAS("userID");
            const type = await Commons.getFromAS("type");
            setEmpType(type);
            setCurUser(curUser);
            setCurLang(curLang);

            console.log('2. Setting customer details...');
            // Set customer details
            setSelectedCust(route.params.custID);
            setLoadingMessage(i18n.t('loadingCustomerDetails'));
            setSelectedCustName(route.params.custName);
            setSelectedCustPhone(route.params.phone);
            setSelectedCustBranch(route.params.branch);

            console.log('3. Getting customer details...');
            //fill cust equipments and contacts
            if (route.params.custID != undefined && route.params.custID != "") {
                const details = await ServerOperations.getCustomerDetails(route.params.custID, route.params.branch || selectedCustBranch);
                if (details != null && details != "" && details != undefined && !isReadOnly) {
                    setContactsList(details.CONTACTS);
                    setCustomerEquipmentsList(details.EQUIPMENTS);
                    setSelectedCustBusinessType(details.BUSINESS_TYPE);
                }
            }

            console.log('4. Checking customer flags...');
            // Check if this is Hygex customer and set flag
            const isHygexCustomer = route.params.custID == "1";
            if (isHygexCustomer) {
                setIsHygex(true);
                console.log('Hygex customer detected - checking location');
            }

            // Check if this is Notes Visit customer and set flag
            const isNotesVisitCustomer = route.params.custID == "2";
            if (isNotesVisitCustomer) {
                setIsNotesVisit(true);
                console.log('Notes Visit customer detected - no location check needed');
            }

            console.log('5. Getting business types...');
            const res2 = await ServerOperations.getBusinessTypes();
            if (res2) {
                setBusinessTypesList(res2);
            }

            if (route.params.pendingVisitID != undefined) {
                setPendingVisitId(route.params.pendingVisitID);
                console.log(route.params.pendingVisitID)
            }
            if (route.params.pendingReqID != undefined) {
                setPendingReqId(route.params.pendingReqID);
            }

            if (route.params.visitID != "" && route.params.visitID != undefined) {
                setVisitID(route.params.visitID);
                const res = await ServerOperations.getVisitDetails(route.params.visitID);
                const currentDate = moment().format('DD/MM/YYYY');
                const canEditRes = await ServerOperations.canEditVisit(route.params.visitID, curUser, currentDate);
                if (res != null && res != "" && res != undefined) {
                    // Process departments and actions to handle multiple attachments
                    const processedDepartments = res.DEPARTMENTS?.map(department => ({
                        ...department,
                        ACTIONS: department.ACTIONS?.map(action => ({
                            ...action,
                            // Convert attachment string to ATTACHMENTS array if it contains separators
                            ATTACHMENTS: action.ATTACHMENT && action.ATTACHMENT.includes('@@')
                                ? action.ATTACHMENT.split('@@')
                                : action.ATTACHMENT ? [action.ATTACHMENT] : []
                        })) || []
                    })) || [];

                    setAddedDepartmentsList(processedDepartments);
                    setAddedRequestsList(res.REQUESTS);
                    //setCheckedActionsList(res.ACTIONS)
                    setSelectedVisitType(res.TYPE);
                    setCallDuration(res.CALL_DURATION);
                    setSelectedCustBranch(res.BRANCH);
                    if (res.CALL_DURATION != "" && res.CALL_DURATION != null && res.CALL_DURATION != undefined && res.CALL_DURATION != "null") {
                        setCallEnded(true);
                    } else {
                        setCallEnded(false);
                    }
                    setSelectedType(res.VISIT_CALL);
                    // setStartLocation(res.START_LOCATION);
                    // Handle visit attachments - check both ATTACHMENTS and ATTACHMENT fields
                    const visitAttachmentsString = res.ATTACHMENTS || res.ATTACHMENT || "";
                    setVisitAttachments(visitAttachmentsString && visitAttachmentsString.trim() !== "" ? visitAttachmentsString.split("@@") : []);
                    setVisitNotes(res.NOTES || "");
                    // Set visitStartTime from visit details if available
                    if (res.START_TIME && res.START_TIME !== "") {
                        setVisitStartTime(res.START_TIME);
                    }
                    if (canEditRes.res) { setIsReadOnly(false); setIgnoreLoc(true); } else { setIsReadOnly(true) };
                    if (res.VISIT_CALL == "Visit" && canEditRes.res) await checkLocationDistance(res.CUSTOMER || route.params.custID, res.BRANCH || route.params.branch);

                }
            }

            if (route.params.visitID == "") {
                setVisitID("NEW");
                setIsReadOnly(false);
            }

            try {
                setLoadingMessage(i18n.t('loadingDepartments'));
                const deps = await ServerOperations.getDepartments();
                if (deps != null && deps != "" && deps != undefined) {
                    setDepartmentsList(deps);
                    setFilteredDepartmentsList(deps);
                    console.log('Departments loaded successfully:', deps.length);
                } else {
                    console.log('Failed to load departments - received:', deps);
                    setDepartmentsList([]);
                    setFilteredDepartmentsList([]);
                }
            } catch (error) {
                console.error('Error loading departments:', error);
                setDepartmentsList([]);
                setFilteredDepartmentsList([]);
            }

            try {
                setLoadingMessage(i18n.t('loadingRequests'));
                const reqs = await ServerOperations.getReqActions(type);
                if (reqs != null && reqs != "" && reqs != undefined) {
                    setRequestsList(reqs);
                    setFilteredRequestsList(reqs);
                    console.log('Request actions loaded successfully:', reqs.length);
                } else {
                    console.log('Failed to load request actions - received:', reqs);
                    setRequestsList([]);
                    setFilteredRequestsList([]);
                }
            } catch (error) {
                console.error('Error loading request actions:', error);
                setRequestsList([]);
                setFilteredRequestsList([]);
            }

            try {
                setLoadingMessage(i18n.t('loadingActions'));
                const acts = await ServerOperations.getActions(type, 'Existing');
                if (acts != null && acts != "" && acts != undefined) {
                    setActionsList(acts);
                    console.log('Actions loaded successfully:', acts.length);
                } else {
                    console.log('Failed to load actions - received:', acts);
                }
            } catch (error) {
                console.error('Error loading actions:', error);
            }

            try {
                setLoadingMessage(i18n.t('loadingVisits'));
                const visits = await ServerOperations.getCustomerVisits(route.params.custID, "Existing", route.params.branch || selectedCustBranch);
                if (visits != null && visits != "" && visits != undefined) {
                    setCustomerVisits(visits);
                    setFilteredCustomerVisits(visits);
                    console.log('Customer visits loaded successfully:', visits.length);
                }
            } catch (error) {
                console.error('Error loading customer visits:', error);
            }

            try {
                setLoadingMessage(i18n.t('loadingEquipments'));
                const equipments = await ServerOperations.getEquipments();
                if (equipments != null && equipments != "" && equipments != undefined) {
                    setDefaultEquipmentsList(equipments);
                    console.log('Equipments loaded successfully:', equipments.length);
                } else {
                    console.log('Failed to load equipments - received:', equipments);
                }
            } catch (error) {
                console.error('Error loading equipments:', error);
            }

            console.log('13. Final location checks...');
            // For Hygex customers (custID "1"), always check location regardless of visit type
            // For Notes Visit customers (custID "2"), skip location check
            // For other customers, only check location if selectedType is "Visit"
            setLoadingMessage(i18n.t('loadingLocationCheck'));
            if (isHygexCustomer) {
                console.log('Checking location for Hygex customer');
                await checkLocationDistance("1", route.params.branch || selectedCustBranch);
            } else if (selectedType === "Visit" && !isNotesVisitCustomer) {
                await checkLocationDistance(route.params.custID, route.params.branch || selectedCustBranch);
            }

            console.log('=== Finished main useEffect ===');
            setLoading(false);
        })();
    }, [route.params.visitID, route.params.custID]);

    // Separate useEffect to handle location checking when selectedType changes for non-Hygex customers
    useEffect(() => {
        (async () => {
            // Only check location for non-Hygex and non-NotesVisit customers when selectedType changes to "Visit"
            if (selectedType === "Visit" && route.params.custID !== "1" && route.params.custID !== "2" && !isReadOnly) {
                await checkLocationDistance(route.params.custID, selectedCustBranch || route.params.branch);
            }
        })();
    }, [selectedType]);

    const checkLocationDistance = async (custID, branch) => {
        // Fetch userType directly to avoid race conditions with state
        const userType = await Commons.getFromAS("type");

        const details = await ServerOperations.getCustomerDetails(custID, branch);
        if (details != null && details != "" && details != undefined && !isReadOnly) {
            setContactsList(details.CONTACTS);
            setCustomerEquipmentsList(details.EQUIPMENTS);
            setSelectedCustBusinessType(details.BUSINESS_TYPE);
            const customerLoc = details.LOCATION;
            const curLoc = await getCurrentLocation();
            console.log(customerLoc);
            if (customerLoc == "") {
                setLoading(false);
                return;
            };
            if (curLoc && customerLoc && !ignoreLoc) {
                const [curLat, curLon] = curLoc.split(',').map(Number);
                const [custLat, custLon] = customerLoc.split(',').map(Number);
                const distance = Commons.calculateDistance(curLat, curLon, custLat, custLon);
                console.log('Distance:', distance);

                // For Hygex customers (custID "1"), allow only 200 meters
                // For Maintenance type users, allow 4000 meters (except Hygex)
                // For all other users, allow 750 meters
                let maxDistance;
                if (custID === "1") {
                    maxDistance = 0.2; // 200 meters for Hygex
                } else if (userType === "Maintenance") {
                    maxDistance = 4; // 4000 meters for Maintenance users
                } else {
                    maxDistance = 0.75; // 750 meters for all other users
                }

                if (distance > maxDistance) {
                    const distanceInMeters = Math.round(distance * 1000);
                    Alert.alert(i18n.t("error"), i18n.t("mustBeInLocation") + ` تبعد (${distanceInMeters}متر)`);
                    navigation.goBack();
                }
            }
        }
    }

    // Refetch functions to avoid code duplication
    const refetchDepartments = async () => {
        console.log('Departments list is empty, attempting to refetch...');
        setLoading(true);
        setLoadingMessage(i18n.t("loading"));
        try {
            const deps = await ServerOperations.getDepartments();
            if (deps != null && deps != "" && deps != undefined) {
                setDepartmentsList(deps);
                setFilteredDepartmentsList(deps);
                console.log('Departments refetched successfully:', deps.length);
                return true;
            } else {
                console.log('Refetch failed - received:', deps);
                Alert.alert(i18n.t("error"), "Failed to load departments. Please try again.");
                return false;
            }
        } catch (error) {
            console.error('Error refetching departments:', error);
            Alert.alert(i18n.t("error"), "Failed to load departments. Please check your connection and try again.");
            return false;
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    const refetchRequestActions = async () => {
        console.log('Requests list is empty, attempting to refetch...');
        setLoading(true);
        setLoadingMessage(i18n.t("loading"));
        try {
            const type = await Commons.getFromAS("type");
            const reqs = await ServerOperations.getReqActions(type);
            if (reqs != null && reqs != "" && reqs != undefined) {
                setRequestsList(reqs);
                setFilteredRequestsList(reqs);
                console.log('Requests refetched successfully:', reqs.length);
                return true;
            } else {
                console.log('Refetch failed - received:', reqs);
                Alert.alert(i18n.t("error"), "Failed to load request actions. Please try again.");
                return false;
            }
        } catch (error) {
            console.error('Error refetching request actions:', error);
            Alert.alert(i18n.t("error"), "Failed to load request actions. Please check your connection and try again.");
            return false;
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    const refetchActions = async () => {
        console.log('Actions list is empty, attempting to refetch...');
        try {
            const type = await Commons.getFromAS("type");
            const acts = await ServerOperations.getActions(type, 'Existing');
            if (acts != null && acts != "" && acts != undefined) {
                setActionsList(acts);
                console.log('Actions refetched successfully:', acts.length);
                return acts;
            } else {
                console.log('Actions refetch failed - received:', acts);
                return [];
            }
        } catch (error) {
            console.error('Error refetching actions:', error);
            return [];
        }
    };

    const refetchEquipments = async () => {
        console.log('Equipments list is empty, attempting to refetch...');
        setLoading(true);
        setLoadingMessage(i18n.t("loading"));
        try {
            const equipments = await ServerOperations.getEquipments();
            if (equipments != null && equipments != "" && equipments != undefined) {
                setDefaultEquipmentsList(equipments);
                console.log('Equipments refetched successfully:', equipments.length);
                return true;
            } else {
                console.log('Equipments refetch failed - received:', equipments);
                return false;
            }
        } catch (error) {
            console.error('Error refetching equipments:', error);
            return false;
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    const saveVisitValidation = () => {
        if (selectedType == "Price Offer") {
            return true;
        }
        if (addedDepartmentsList.length === 0 && addedRequestsList.length === 0) {
            setLoading(false);
            Alert.alert(i18n.t("error"), i18n.t("noDepartmentsOrRequestsError"));
            return false;
        }
        if (selectedType == "") {
            setLoading(false);
            Alert.alert(i18n.t("error"), i18n.t("selectVisitCall"));
            return false;
        }
        if (selectedType == "Call" && callDuration == null) {
            setLoading(false);
            Alert.alert(i18n.t("error"), i18n.t("callNotEnded"));
            return false;
        }
        return true;
    }


    const saveVisit = async () => {
        // Prevent multiple calls by checking if already loading
        if (loading) {
            return;
        }
        setLoading(true);
        setLoadingMessage(i18n.t("saving"));
        try {
            if (!isHygex && !isNotesVisit) {
                const valid = saveVisitValidation();
                if (!valid) return;
            }

            // Validation for isNotesVisit - check if both notes and attachments are empty
            if (isNotesVisit) {
                if ((visitNotes.trim() === "" || visitNotes.trim() === null || visitNotes.trim() === undefined) &&
                    (visitAttachments.length === 0)) {
                    setLoading(false);
                    Alert.alert(i18n.t("error"), i18n.t("emptyNotesAndAttachmentsError"));
                    return;
                }
            }

            // Ensure startLocation is set for Visit type (except Notes Visit customer "2")
            if (selectedType === "Visit" && route.params.custID !== "2") {
                if (!startLocation || startLocation === "" || startLocation === undefined) {
                    setLoadingMessage(i18n.t("fetchingLocation"));
                    const loc = await getCurrentLocation();
                    if (loc) {
                        setStartLocation(loc);
                    }
                }
            }

            // Check location distance before saving (only for Visit type and exclude NotesVisit customers)
            if (selectedType === "Visit" && !isNotesVisit) {
                setLoadingMessage(i18n.t("fetchingLocation"));
                try {
                    await checkLocationDistance(selectedCust, selectedCustBranch || route.params.branch);
                } catch (error) {
                    console.log('Location check failed during save:', error);
                    // If location check fails, still continue unless the user is redirected back
                    // The checkLocationDistance function handles showing alerts and navigation
                }
            }

            setLoadingMessage(i18n.t("saving"));

            let addedDeps = [];
            let processedRequestsList = [];

            if (isNotesVisit) {
                // For Notes Visit, don't add to departments - keep them empty
                addedDeps = [];
                processedRequestsList = [];
            } else {
                addedDeps = addedDepartmentsList.map(department => ({
                    ...department,
                    ACTIONS: department.ACTIONS.filter(action => action.IS_CHECKED || action.EXPECTED_DATE)
                }));
                addedDeps.forEach(department => {
                    department.ACTIONS.forEach(action => {
                        action.IS_CHECKED = action.IS_CHECKED ? "Y" : "N";
                        if (action.EQUIPMENTS) {
                            action.EQUIPMENTS.forEach(equipment => {
                                equipment.isEmpty = equipment.isEmpty ? "Y" : "N";
                            });
                        }
                        // Handle multiple attachments - convert array to string with separator
                        if (action.ATTACHMENTS && action.ATTACHMENTS.length > 0) {
                            action.ATTACHMENT = action.ATTACHMENTS.join('@@');
                        }
                        console.log(action.EQUIPMENTS);
                    });
                });

                // Process request equipments
                processedRequestsList = addedRequestsList.map(request => ({
                    ...request,
                    EQUIPMENTS: request.EQUIPMENTS ? request.EQUIPMENTS.map(equipment => ({
                        ...equipment,
                        isEmpty: equipment.isEmpty ? "Y" : "N"
                    })) : []
                }));
            }

            console.log(JSON.stringify(addedDeps));
            console.log(JSON.stringify(processedRequestsList));


            let endLocation;
            if (isNotesVisit) {
                // For Notes Visit, skip location fetching
                endLocation = "";
            } else {
                if (selectedType == "Visit") {
                    try { await checkLocationDistance(selectedCust, selectedCustBranch || route.params.branch); } catch (e) { console.log('Distance check failed', e); }
                }
            }
            setLoadingMessage(i18n.t("saving"));

            // Prepare attachments string for isNotesVisit
            let atts = "";
            if (isNotesVisit && visitAttachments.length > 0) {
                atts = visitAttachments.join('@@');
            }

            // console.log(JSON.stringify(addedRequestsList))
            console.log('About to call ServerOperations.saveVisit...');
            // Check if there's a pending request ID and ask user about its status
            let requestStatus = ""; // Default status
            if (pendingReqId && pendingReqId !== "") {
                setLoading(false);
                const userChoice = await new Promise((resolve) => {
                    Alert.alert(
                        i18n.t("pendingRequest"),
                        i18n.t("isPendingRequestDone"),
                        [
                            {
                                text: i18n.t("keepPending"),
                                onPress: () => resolve("")
                            },
                            {
                                text: i18n.t("markAsDone"),
                                onPress: () => resolve("Y")
                            }
                        ],
                        { cancelable: false }
                    );
                });
                requestStatus = userChoice;
                setLoading(true);
                setLoadingMessage(i18n.t("saving"));
            }

            // Continue with normal save operation using requestStatus variable
            let response;
            try {
                response = await ServerOperations.saveVisit(
                    selectedType,
                    selectedVisitType,
                    callDuration,
                    JSON.stringify(addedDeps),
                    JSON.stringify(processedRequestsList),
                    curUser,
                    selectedCust,
                    "Existing",
                    visitID,
                    "",
                    "",
                    startLocation,
                    endLocation,
                    pendingVisitId,
                    pendingReqId,
                    selectedCustBranch,
                    visitStartTime,
                    visitNotes,
                    atts,
                    requestStatus
                );
            } catch (apiError) {
                // If the API call itself failed, show specific error
                if (apiError.message && apiError.message.includes('Network')) {
                    Alert.alert(
                        i18n.t("error"),
                        i18n.t("unexpectedErrorVisitMaybeSaved"),
                        [
                            { text: i18n.t("ok"), onPress: () => navigation.goBack() }
                        ]
                    );
                } else {
                    Alert.alert(
                        i18n.t("error"),
                        i18n.t("unexpectedErrorVisitMaybeSaved"),
                        [
                            { text: i18n.t("ok"), onPress: () => navigation.goBack() }
                        ]
                    );
                }
                return;
            }            // Validate response exists and has expected structure
            if (!response) {
                console.warn('Invalid response received from saveVisit:', response);
                Alert.alert(
                    i18n.t("error"),
                    i18n.t("unexpectedErrorVisitMaybeSaved"),
                    [
                        { text: i18n.t("ok"), onPress: () => navigation.goBack() }
                    ]
                );
                return;
            }

            // Check for successful response
            if (response.res === true) {
                console.log('Visit saved successfully, VISIT_ID:', response.VISIT_ID);
                Alert.alert(i18n.t("visitSavedSuccessfully"), i18n.t("visitNo") + " " + response.VISIT_ID);
                navigation.goBack();
            } else if (response.res === false) {
                console.log('Visit save failed, response.msg:', response.msg);
                Alert.alert(i18n.t("error"), response.msg || i18n.t("visitSaveFailed"));
            } else {
                // Handle cases where response.res is neither true nor false
                console.warn('Ambiguous response.res value:', response.res, 'Full response:', response);
                Alert.alert(
                    i18n.t("error"),
                    i18n.t("unexpectedErrorVisitMaybeSaved"),
                    [
                        { text: i18n.t("ok"), onPress: () => navigation.goBack() }
                    ]
                );
            }
        } catch (error) {
            console.error('Unexpected error in saveVisit:', error);

            // Provide user-friendly error message for unexpected errors
            Alert.alert(
                i18n.t("error"),
                i18n.t("unexpectedErrorVisitMaybeSaved"),
                [
                    { text: i18n.t("ok"), onPress: () => navigation.goBack() }
                ]
            );
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    const handleEquipmentPress = (item) => {
        const isSelected = selectedEquipments.some(eq => eq.EQ_NO === item.EQ_NO);
        if (isSelected) {

            setSelectedEquipments(selectedEquipments.filter(eq => eq.EQ_NO !== item.EQ_NO));
        } else {
            setSelectedEquipments([...selectedEquipments, {
                ...item,
                isEmpty: false,
                notes: ''
            }]);
        }
    };

    const handleEmptyChange = (itemEqNo) => {
        const updatedEquipments = selectedEquipments.map(eq => {
            if (eq.EQ_NO === itemEqNo) {
                return { ...eq, isEmpty: !eq.isEmpty };
            }
            return eq;
        });
        setSelectedEquipments(updatedEquipments);
    };

    const handleNotesChange = (itemEqNo, text) => {
        const updatedEquipments = selectedEquipments.map(eq => {
            if (eq.EQ_NO === itemEqNo) {
                return { ...eq, notes: text };
            }
            return eq;
        });
        setSelectedEquipments(updatedEquipments);
    };

    const handleSaveEquipments = () => {
        // Check if any equipment is already in the action's equipment list
        const actionIndex = checkedActionsList.findIndex(act => act.ID === selectedAction);
        if (actionIndex !== -1) {
            const updatedActions = [...checkedActionsList];
            if (!updatedActions[actionIndex].EQUIPMENTS) {
                updatedActions[actionIndex].EQUIPMENTS = [];
            }
            // Don't add equipment if already exists, just modify it
            const existingEquipments = updatedActions[actionIndex].EQUIPMENTS || [];
            const updatedEquipments = existingEquipments.filter(eq =>
                !selectedEquipments.some(selected => selected.EQ_NO === eq.EQ_NO)
            );
            selectedEquipments.forEach(item => {
                const equipmentIndex = updatedActions[actionIndex].EQUIPMENTS.findIndex(eq => eq.EQ_NO === item.EQ_NO);
                const equipmentToSave = {
                    EQ_NO: item.EQ_NO,
                    EN_DESC: item.EN_DESC,
                    AR_DESC: item.AR_DESC,
                    isEmpty: item.isEmpty || false,
                    notes: item.notes || ''
                };

                if (equipmentIndex !== -1) {
                    // Update existing equipment
                    updatedActions[actionIndex].EQUIPMENTS[equipmentIndex] = equipmentToSave;
                } else {
                    // Add new equipment
                    updatedActions[actionIndex].EQUIPMENTS.push(equipmentToSave);
                }
            });

            setCheckedActionsList(updatedActions);
        }
        setShowEquipmentsModal(false);
    };

    const openDialer = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
        setCallStartTime(new Date());
    };

    const calculateCallDuration = () => {
        if (callStartTime) {
            const endTime = new Date();
            const duration = moment.duration(moment(endTime).diff(moment(callStartTime)));
            const minutes = String(duration.minutes()).padStart(2, '0');
            const seconds = String(duration.seconds()).padStart(2, '0');
            const hours = String(duration.hours()).padStart(2, '0');
            setCallDuration(`${hours}:${minutes}:${seconds}`);

            setCallEnded(true);
        } else {
            Alert.alert(i18n.t("error"), i18n.t("noCallStarted"));
        }
    };

    const handleAttachmentPress = (attachment) => {
        const uri = Constants.attachmentPath + "/" + attachment;
        console.log('Open attachment', uri);
        Commons.openAttachment(uri);
    };

    // const previewImage = (uri) => {
    //     setImageUri(uri); // Set the URI of the image to be displayed
    //     setImagePreviewVisible(true); // Open the image preview modal
    // };

    const addReqActionValidations = () => {
        // Check if notes are required and missing
        if (reqDetailsNotes.trim() === "" && selectedRequestNotesRequired === "Y") {
            Alert.alert(i18n.t("error"), i18n.t("emptyNotesError"));
            return false;
        }

        // Check if request has either notes or attachments (at least one is required)
        if (reqDetailsNotes.trim() === "" && reqDetailsAttachment.trim() === "") {
            Alert.alert(i18n.t("error"), i18n.t("emptyNotesAndAttachmentsError"));
            return false;
        }

        if (reqDetailsDepartments === null || reqDetailsDepartments.length === 0) {
            Alert.alert(i18n.t("error"), i18n.t("missingDepartmentError"));
            return false;
        }

        return true;
    }

    const handleReqEquipmentPress = (item) => {
        const isSelected = selectedReqEquipments.some(eq => eq.EQ_NO === item.EQ_NO);
        if (isSelected) {
            setSelectedReqEquipments(selectedReqEquipments.filter(eq => eq.EQ_NO !== item.EQ_NO));
        } else {
            setSelectedReqEquipments([...selectedReqEquipments, {
                ...item,
                isEmpty: false,
                notes: ''
            }]);
        }
    };

    const handleReqEquipmentEmptyChange = (itemEqNo) => {
        const updatedEquipments = selectedReqEquipments.map(eq => {
            if (eq.EQ_NO === itemEqNo) {
                return { ...eq, isEmpty: !eq.isEmpty };
            }
            return eq;
        });
        setSelectedReqEquipments(updatedEquipments);
    };

    const handleReqEquipmentNotesChange = (itemEqNo, text) => {
        setSelectedReqEquipments(prevEquipments =>
            prevEquipments.map(eq => {
                if (eq.EQ_NO === itemEqNo) {
                    return { ...eq, notes: text };
                }
                return eq;
            })
        );
    };

    const addActionValidations = () => {
        const emptyNotesAndAttachments = checkedActionsList.some(action =>
            (action.IS_CHECKED || action.EXPECTED_DATE.trim() !== "") &&
            action.NOTES.trim() === "" &&
            (!action.ATTACHMENTS || action.ATTACHMENTS.length === 0) &&
            !action.ATTACHMENT
        );
        if (emptyNotesAndAttachments) {
            Alert.alert(i18n.t("error"), i18n.t("emptyNotesAndAttachmentsError"));
            return false;
        }

        const missingEquipments = checkedActionsList.some(action =>
            (action.IS_CHECKED || action.EXPECTED_DATE.trim() !== "") &&
            action.EQUIPMENTS_REQUIRED &&
            (action.EQUIPMENTS || []).length === 0
        );
        // const missingEquipments = checkedActionsList.some(action => (action.IS_CHECKED || action.EXPECTED_DATE.trim() !== "") && (action.EQUIPMENTS || []).length === 0);
        if (missingEquipments && empType !== "Salesman") {
            Alert.alert(i18n.t("error"), i18n.t("missingEquipmentsError"));
            return false;
        }
        const noActionSelected = !checkedActionsList.some(action => action.IS_CHECKED || action.EXPECTED_DATE.trim() !== "");
        if (noActionSelected) {
            Alert.alert(i18n.t("error"), i18n.t("noActionSelectedError"));
            return false;
        }

        return true;
    }

    const renderCustomerEquipmentsModal = () => {
        // Refresh handler for customer equipments
        const refreshCustomerEquipments = async () => {
            setLoading(true);
            setLoadingMessage(i18n.t("loading"));
            try {
                const details = await ServerOperations.getCustomerDetails(selectedCust, selectedCustBranch);
                if (details && Array.isArray(details.EQUIPMENTS)) {
                    setCustomerEquipmentsList(details.EQUIPMENTS);
                } else {
                    setCustomerEquipmentsList([]);
                }
            } catch (err) {
                console.error('Failed to refresh customer equipments:', err);
                Alert.alert(i18n.t('error'), i18n.t('loading'));
            } finally {
                setLoading(false);
                setLoadingMessage("");
            }
        };

        return (
            <Modal visible={showCustomerEquipmentsModal} onDismiss={() => setShowCustomerEquipmentsModal(false)} contentContainerStyle={styles.modalStyle}>
                <View style={{ width: '100%', backgroundColor: Constants.appColor, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{i18n.t("equipments")}</Text>
                    <TouchableOpacity
                        onPress={refreshCustomerEquipments}
                        style={curLang == 'ar' ? { position: 'absolute', left: 12 } : { position: 'absolute', right: 12 }}
                        accessibilityLabel={i18n.t('refresh')}
                    >
                        <Ionicons name="refresh" size={22} color="white" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    keyExtractor={(item) => item.EQ_NO}
                    data={customerEquipmentsList}
                    extraData={customerEquipmentsList}
                    renderItem={({ item }) => (
                        <View style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}>
                            <Text style={{ color: "red", alignSelf: 'center' }}>{item.EQ_NO}</Text>
                            <Text style={{ alignSelf: 'center', marginTop: 10 }}>{curLang == "en" ? item.EN_DESC : item.AR_DESC}</Text>
                            <Text style={{ alignSelf: 'center', marginTop: 10 }}>{i18n.t("qty")} {" : "} {item.QTY}</Text>
                        </View>
                    )}
                />
                <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => setShowCustomerEquipmentsModal(false)}>
                    <Text style={styles.text}>{i18n.t("back")}</Text>
                </Button>
            </Modal>
        );
    };

    const renderEquipmentsModal = () => {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <Modal
                    visible={showEquipmentsModal}
                    onDismiss={() => setShowEquipmentsModal(false)}
                    contentContainerStyle={[styles.modalStyle, { height: '100%', justifyContent: 'space-between' }]}
                >
                    <TextInput
                        placeholder={i18n.t("search")}
                        clearButtonMode="always"
                        style={styles.searchBox}
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            const filteredList = Commons.handleSearch(text, equipmentsList);
                            setFilteredEquipmentsList(filteredList);
                        }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>
                            {i18n.t("equipments")}
                        </Text>
                        <FlatList
                            keyExtractor={(item) => item.EQ_NO}
                            data={filteredEquipmentsList}
                            extraData={selectedEquipments}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            renderItem={({ item }) => {
                                const existingEquipment = selectedEquipments.find(eq => eq.EQ_NO === item.EQ_NO);
                                return (
                                    <TouchableOpacity
                                        onPress={() => { handleEquipmentPress(item) }}
                                        style={{
                                            padding: 15,
                                            borderWidth: 0.5,
                                            borderRadius: 5,
                                            marginBottom: 5,
                                            backgroundColor: existingEquipment ? '#ececec' : 'white'
                                        }}
                                    >
                                        <Text style={{ color: "red", alignSelf: 'center' }}>{item.EQ_NO}</Text>
                                        <Text style={{ alignSelf: 'center', marginTop: 10 }}>
                                            {curLang == "en" ? item.EN_DESC : item.AR_DESC}
                                        </Text>
                                        {existingEquipment && (
                                            <>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                                    <Text>{i18n.t("isEmpty")}</Text>
                                                    <RadioButton
                                                        value="empty"
                                                        status={existingEquipment.isEmpty ? 'checked' : 'unchecked'}
                                                        onPress={() => {
                                                            const updatedEquipments = selectedEquipments.map(eq => {
                                                                if (eq.EQ_NO === item.EQ_NO) {
                                                                    return { ...eq, isEmpty: !eq.isEmpty };
                                                                }
                                                                return eq;
                                                            });
                                                            setSelectedEquipments(updatedEquipments);
                                                        }}
                                                    />
                                                </View>
                                                <TextInput
                                                    key={`equipment-notes-${item.EQ_NO}`}
                                                    placeholder={i18n.t("notes")}
                                                    disabled={isReadOnly}
                                                    multiline={true}
                                                    defaultValue={existingEquipment.notes || ''}
                                                    onChangeText={(text) => {
                                                        setSelectedEquipments(prevEquipments =>
                                                            prevEquipments.map(eq => {
                                                                if (eq.EQ_NO === item.EQ_NO) {
                                                                    return { ...eq, notes: text };
                                                                }
                                                                return eq;
                                                            })
                                                        );
                                                    }}
                                                    textAlign="left"
                                                    textAlignVertical="top"
                                                    style={{
                                                        marginTop: 10,
                                                        minHeight: 40,
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 8,
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        borderRadius: 4,
                                                        backgroundColor: '#fff'
                                                    }}
                                                />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: "row-reverse", paddingTop: 10 }}>
                        <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={handleSaveEquipments}>
                            <Text style={styles.text}>{i18n.t("save")}</Text>
                        </Button>
                        <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => setShowEquipmentsModal(false)}>
                            <Text style={styles.text}>{i18n.t("back")}</Text>
                        </Button>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        );
    };

    const renderReqEquipmentsModal = () => {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <Modal
                    visible={showReqEquipmentsModal}
                    onDismiss={() => setShowReqEquipmentsModal(false)}
                    contentContainerStyle={[styles.modalStyle, { justifyContent: 'space-between', height: '100%' }]}
                >
                    <TextInput
                        placeholder={i18n.t("search")}
                        clearButtonMode="always"
                        style={styles.searchBox}
                        value={searchText}
                        onChangeText={(text) => {
                            setSearchText(text);
                            const filteredList = Commons.handleSearch(text, defaultEquipmentsList);
                            setFilteredEquipmentsList(filteredList);
                        }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>
                            {i18n.t("equipments")}
                        </Text>
                        <FlatList
                            keyExtractor={(item) => item.EQ_NO}
                            data={filteredEquipmentsList}
                            extraData={selectedReqEquipments}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            renderItem={({ item }) => {
                                const existingEquipment = selectedReqEquipments.find(eq => eq.EQ_NO === item.EQ_NO);
                                return (
                                    <TouchableOpacity
                                        onPress={() => handleReqEquipmentPress(item)}
                                        style={{
                                            padding: 15,
                                            borderWidth: 0.5,
                                            borderRadius: 5,
                                            marginBottom: 5,
                                            backgroundColor: existingEquipment ? '#ececec' : 'white'
                                        }}
                                    >
                                        <Text style={{ color: "red", alignSelf: 'center' }}>{item.EQ_NO}</Text>
                                        <Text style={{ alignSelf: 'center', marginTop: 10 }}>
                                            {curLang == "en" ? item.EN_DESC : item.AR_DESC}
                                        </Text>
                                        {existingEquipment && (
                                            <>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                                    <Text>{i18n.t("isEmpty")}</Text>
                                                    <RadioButton
                                                        value="empty"
                                                        status={existingEquipment.isEmpty ? 'checked' : 'unchecked'}
                                                        onPress={() => handleReqEquipmentEmptyChange(item.EQ_NO)}
                                                    />
                                                </View>
                                                <TextInput
                                                    key={`req-equipment-notes-${item.EQ_NO}`}
                                                    placeholder={i18n.t("notes")}
                                                    disabled={isReadOnly}
                                                    multiline={true}
                                                    defaultValue={existingEquipment.notes || ''}
                                                    onChangeText={(text) => handleReqEquipmentNotesChange(item.EQ_NO, text)}
                                                    textAlign="left"
                                                    textAlignVertical="top"
                                                    style={{
                                                        marginTop: 10,
                                                        minHeight: 40,
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 8,
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        borderRadius: 4,
                                                        backgroundColor: '#fff'
                                                    }}
                                                />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: "row-reverse", paddingTop: 10 }}>
                        <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={handleSaveReqEquipments}>
                            <Text style={styles.text}>{i18n.t("save")}</Text>
                        </Button>
                        <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => setShowReqEquipmentsModal(false)}>
                            <Text style={styles.text}>{i18n.t("back")}</Text>
                        </Button>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        );
    };

    const handleSaveReqEquipments = () => {
        setReqDetailsEquipments(selectedReqEquipments);
        setShowReqEquipmentsModal(false);
    };


    // const renderImagePreviewModal = () => {
    //     return (
    //         <Modal
    //             visible={imagePreviewVisible}
    //             animationType="fade"
    //             onRequestClose={() => setImagePreviewVisible(false)}
    //             contentContainerStyle={styles.modalStyle}
    //         >
    //             <View style={styles.previewContainer}>
    //                 <Image source={{ uri: imageUri }} style={styles.previewImage} />
    //                 <TouchableOpacity
    //                     style={styles.closeButton}
    //                     onPress={() => setImagePreviewVisible(false)}
    //                 >
    //                     <Text style={styles.closeButtonText}>{i18n.t("back")}</Text>
    //                 </TouchableOpacity>
    //             </View>
    //         </Modal>
    //     )
    // }

    const renderAddDepartmentDialog = () => {
        return (
            <Modal visible={showAddDepartmentDialog} onDismiss={() => setShowAddDepartmentDialog(false)} contentContainerStyle={styles.modalStyle}>
                <TextInput
                    placeholder={i18n.t("search")}
                    clearButtonMode="always"
                    style={styles.searchBox}
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        const list = Commons.handleSearch(text, departmentsList);
                        setFilteredDepartmentsList(list);
                    }}
                />
                <Text style={styles.modalTitle}>
                    {i18n.t("departments")}
                </Text>
                <FlatList
                    keyExtractor={(item) => item.ID}
                    data={filteredDepartmentsList}
                    extraData={filteredDepartmentsList}
                    renderItem={renderDepartmentItem}
                />
                <Button mode="contained" style={{ borderRadius: 0 }} onPress={async () => {
                    setShowAddDepartmentDialog(false);
                }}>
                    <Text style={styles.text}>{i18n.t("back")}</Text>
                </Button>

            </Modal>


        )
    }
    const renderAddReqDepartmentDialog = () => {
        return (
            <Modal visible={showAddReqDepartmentDialog} onDismiss={() => { setShowAddReqDepartmentDialog(false); setShowReqActionModal(true) }} contentContainerStyle={styles.modalStyle} >
                <TextInput
                    placeholder={i18n.t("search")}
                    clearButtonMode="always"
                    style={styles.searchBox}
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        const list = Commons.handleSearch(text, departmentsList);
                        setFilteredDepartmentsList(list);
                    }}
                />
                <Text style={styles.modalTitle}>
                    {i18n.t("departments")}
                </Text>
                <FlatList
                    keyExtractor={(item) => item.ID}
                    data={filteredDepartmentsList}
                    extraData={filteredDepartmentsList}
                    renderItem={renderReqDepartmentItem}
                />
                <Button mode="contained" style={{ borderRadius: 0 }} onPress={async () => {
                    setShowAddReqDepartmentDialog(false); setShowReqActionModal(true)
                }}>
                    <Text style={styles.text}>{i18n.t("back")}</Text>
                </Button>

            </Modal >


        )
    }

    const renderAddActionModal = () => {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <Modal visible={showAddActionModal} transparent={false} onDismiss={() => {
                    setShowActionModal(false);
                    setActionsLoading(false);
                }} contentContainerStyle={[styles.modalStyle, { justifyContent: 'space-between', height: '100%' }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>
                            {i18n.t("actions")}
                        </Text>
                        <Text style={styles.modalTitle}>
                            {curLang == "en" && selectedDepartmentEnDesc} {curLang == "ar" && selectedDepartmentArDesc}
                        </Text>
                        {actionsLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Constants.darkBlueColor} />
                                <Text style={styles.loadingText}>{i18n.t("loading")}</Text>
                            </View>
                        ) : (
                            <FlatList
                                keyExtractor={(item) => item.ID}
                                data={actionsList}
                                extraData={actionsList}
                                style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 10 }}
                                renderItem={renderActionItem}
                            />
                        )}
                    </View>
                    {!showEquipmentsModal && !showReqEquipmentsModal && (
                        <View style={{ flexDirection: "row", paddingTop: 10 }}>
                            <Button mode="contained" icon={({ size, color }) => (
                                <Ionicons name="arrow-back" size={size} color={color} />
                            )} style={{ borderRadius: 0, flex: isReadOnly ? 1 : 0.5, marginHorizontal: 2 }} onPress={async () => {
                                setCheckedActionsList([]);
                                setActionsLoading(false);
                                setShowActionModal(false);
                            }}>
                                <Text style={styles.text}>{i18n.t("back")}</Text>
                            </Button>
                            {!isReadOnly && (<Button mode="contained" icon={({ size, color }) => (
                                <Ionicons name="save" size={size} color={color} />
                            )} style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={async () => {
                                const valid = addActionValidations();
                                if (!valid) return;
                                let adList = addedDepartmentsList;
                                const existingDepartmentIndex = adList.findIndex(dept => dept.ID === selectedDepartment);
                                if (existingDepartmentIndex !== -1) {
                                    adList[existingDepartmentIndex] = {
                                        ID: selectedDepartment,
                                        EN_DESC: selectedDepartmentEnDesc,
                                        AR_DESC: selectedDepartmentArDesc,
                                        ACTIONS: checkedActionsList,
                                        LOCATION: startLocation
                                    };
                                } else {
                                    adList.push({
                                        ID: selectedDepartment,
                                        EN_DESC: selectedDepartmentEnDesc,
                                        AR_DESC: selectedDepartmentArDesc,
                                        ACTIONS: checkedActionsList,
                                        LOCATION: startLocation
                                    });
                                }
                                setAddedDepartmentsList(adList);
                                setActionsLoading(false);
                                setShowActionModal(false);
                            }}>
                                <Text style={styles.text}>{i18n.t("save")}</Text>
                            </Button>)}
                        </View>
                    )}

                </Modal>
            </KeyboardAvoidingView>


        )
    }

    const renderActionItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                }}
            >
                <View
                    style={{
                        padding: 15,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        marginBottom: 5

                    }}
                >
                    {curLang == "en" && (<Text style={[styles.text2(curLang), { color: "red" }]}>{item.EN_DESC}</Text>)}
                    {curLang == "ar" && (<Text style={[styles.text2(curLang), { color: "red" }]}>{item.AR_DESC}</Text>)}
                    {!isReadOnly && (<AttachmentPicker onAttachmentSelected={(attachment) => {
                        // Check if action exists in checkedActionsList
                        const actionExists = checkedActionsList.some(act => act.ID == item.ID);

                        let updatedActionsList;
                        if (actionExists) {
                            // Update existing action
                            updatedActionsList = checkedActionsList.map((act) => {
                                if (act.ID == item.ID) {
                                    // Create a new action object to avoid mutations
                                    const updatedAction = { ...act };
                                    // Initialize ATTACHMENTS array if it doesn't exist
                                    if (!updatedAction.ATTACHMENTS) {
                                        updatedAction.ATTACHMENTS = [];
                                    }
                                    // Add new attachment to a new array (avoid mutation)
                                    updatedAction.ATTACHMENTS = [...updatedAction.ATTACHMENTS, attachment];
                                    // Keep single ATTACHMENT for backward compatibility
                                    if (!updatedAction.ATTACHMENT) {
                                        updatedAction.ATTACHMENT = attachment;
                                    }
                                    return updatedAction;
                                }
                                return act;
                            });
                        } else {
                            // Add new action to checkedActionsList with the attachment
                            const newAction = {
                                ID: item.ID,
                                EN_DESC: item.EN_DESC,
                                AR_DESC: item.AR_DESC,
                                ATTACHMENT: attachment,
                                ATTACHMENTS: [attachment],
                                NOTES: "",
                                IS_CHECKED: false,
                                EXPECTED_DATE: "",
                                DEPARTMENT: selectedDepartment,
                                EQUIPMENTS: []
                            };
                            updatedActionsList = [...checkedActionsList, newAction];
                        }
                        setCheckedActionsList(updatedActionsList);

                        // Find the current department in addedDepartmentsList and update
                        const currentDeptIndex = addedDepartmentsList.findIndex(dept => dept.ID === selectedDepartment);
                        if (currentDeptIndex !== -1) {
                            // Department exists, update its actions
                            const updatedDepartmentsList = addedDepartmentsList.map((department, index) => {
                                if (index === currentDeptIndex) {
                                    return {
                                        ...department,
                                        ACTIONS: updatedActionsList
                                    };
                                }
                                return department;
                            });
                            setAddedDepartmentsList(updatedDepartmentsList);
                        } else {
                            // Department doesn't exist yet, it will be created when saving the modal
                            // The updatedActionsList will be used when creating the department
                        }
                    }} />)}

                    {checkedActionsList.find(act => act.ID === item.ID)?.ATTACHMENTS &&
                        checkedActionsList.find(act => act.ID === item.ID)?.ATTACHMENTS.length > 0 && (
                            <ScrollView style={{ marginTop: 10, maxHeight: 120 }} nestedScrollEnabled={true}>
                                {checkedActionsList.find(act => act.ID === item.ID)?.ATTACHMENTS.map((attachment, index) => (
                                    <View key={index} style={{
                                        flexDirection: curLang == "ar" ? "row-reverse" : "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 5,
                                        padding: 8,
                                        borderWidth: 0.5,
                                        borderColor: "#ccc",
                                        borderRadius: 5,
                                        backgroundColor: "#f9f9f9"
                                    }}>
                                        <TouchableOpacity
                                            onPress={() => handleAttachmentPress(attachment)}
                                            style={{ flex: 1 }}
                                        >
                                            <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                                                {attachment}
                                            </Text>
                                        </TouchableOpacity>
                                        {!isReadOnly && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    // Update checkedActionsList
                                                    const updatedActions = checkedActionsList.map((act) => {
                                                        if (act.ID === item.ID && act.ATTACHMENTS) {
                                                            const updatedAttachments = act.ATTACHMENTS.filter((_, i) => i !== index);
                                                            act.ATTACHMENTS = updatedAttachments;
                                                            // Update single ATTACHMENT field for backward compatibility
                                                            act.ATTACHMENT = updatedAttachments.length > 0 ? updatedAttachments[0] : "";
                                                        }
                                                        return act;
                                                    });
                                                    setCheckedActionsList(updatedActions);

                                                    // Also update addedDepartmentsList to keep data in sync
                                                    const updatedDepartmentsList = addedDepartmentsList.map(department => ({
                                                        ...department,
                                                        ACTIONS: department.ACTIONS.map(action => {
                                                            if (action.ID === item.ID && action.ATTACHMENTS) {
                                                                const updatedAttachments = action.ATTACHMENTS.filter((_, i) => i !== index);
                                                                action.ATTACHMENTS = updatedAttachments;
                                                                // Update single ATTACHMENT field for backward compatibility
                                                                action.ATTACHMENT = updatedAttachments.length > 0 ? updatedAttachments[0] : "";
                                                            }
                                                            return action;
                                                        })
                                                    }));
                                                    setAddedDepartmentsList(updatedDepartmentsList);
                                                }}
                                                style={{ marginLeft: 10 }}
                                            >
                                                <Ionicons name="trash" size={20} color="red" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        )}


                    <TextInput
                        key={`action-notes-${item.ID}`}
                        placeholder={i18n.t("notes")}
                        multiline={true}
                        defaultValue={checkedActionsList.find(act => act.ID === item.ID)?.NOTES || ""}
                        onChangeText={(text) => {
                            // Check if action exists in checkedActionsList
                            const actionExists = checkedActionsList.some(act => act.ID == item.ID);

                            if (actionExists) {
                                // Update existing action using immutable approach
                                setCheckedActionsList(prevList =>
                                    prevList.map((act) => {
                                        if (act.ID == item.ID) {
                                            return { ...act, NOTES: text };
                                        }
                                        return act;
                                    })
                                );
                            } else {
                                // Add new action to checkedActionsList with the notes
                                const newAction = {
                                    ID: item.ID,
                                    EN_DESC: item.EN_DESC,
                                    AR_DESC: item.AR_DESC,
                                    ATTACHMENT: "",
                                    ATTACHMENTS: [],
                                    NOTES: text,
                                    IS_CHECKED: false,
                                    EXPECTED_DATE: "",
                                    DEPARTMENT: selectedDepartment,
                                    EQUIPMENTS: []
                                };
                                setCheckedActionsList(prevList => [...prevList, newAction]);
                            }
                        }}
                        textAlign="left"
                        textAlignVertical="top"
                        style={{
                            minHeight: 40,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 4,
                            backgroundColor: '#fff'
                        }}
                    />
                    <TouchableOpacity style={{ flexDirection: curLang == "ar" ? 'row' : 'row-reverse', justifyContent: "space-between", backgroundColor: Constants.darkBlueColor, paddingVertical: 7, marginTop: 10, width: "100%", paddingHorizontal: 10 }} onPress={async () => {
                        if (!isReadOnly) {
                            setSelectedAction(item.ID);
                            const selectedAction = item.ID;
                            const useCustEquipments = actionsList.find(act => act.ID === selectedAction)?.USE_CUSTOMER_EQUIPMENTS || false;

                            // Check if equipments list is empty and refetch if needed
                            if (!useCustEquipments && defaultEquipmentsList.length === 0) {
                                await refetchEquipments();
                            }
                            if (useCustEquipments && (!customerEquipmentsList || customerEquipmentsList.length === 0)) {
                                // Refetch customer details to obtain equipments if missing
                                setLoading(true);
                                setLoadingMessage(i18n.t("loading"));
                                try {
                                    const details = await ServerOperations.getCustomerDetails(selectedCust, selectedCustBranch);
                                    if (details && Array.isArray(details.EQUIPMENTS)) {
                                        setCustomerEquipmentsList(details.EQUIPMENTS);
                                    } else {
                                        setCustomerEquipmentsList([]); // ensure defined
                                    }
                                } catch (err) {
                                    console.error("Failed to fetch customer equipments:", err);
                                } finally {
                                    setLoading(false);
                                    setLoadingMessage("");
                                }
                            }

                            if (useCustEquipments) {
                                setEquipmentsList(customerEquipmentsList);
                                setFilteredEquipmentsList(customerEquipmentsList);
                            } else {
                                setEquipmentsList(defaultEquipmentsList);
                                setFilteredEquipmentsList(defaultEquipmentsList);
                            }
                            setShowEquipmentsModal(true);
                            setSelectedEquipments([]);
                        }
                    }}>
                        <Ionicons name="add-circle-outline" size={26} color="white" />
                        <Text style={{ textAlign: "flex-end", fontSize: 16, color: "white", fontWeight: "bold" }}>
                            {i18n.t("equipments")}
                        </Text>
                    </TouchableOpacity>
                    <FlatList
                        keyExtractor={(equipment) => equipment.EQ_NO}
                        data={checkedActionsList.find(act => act.ID === item.ID)?.EQUIPMENTS || []}
                        style={{ marginVertical: 10 }}
                        renderItem={({ item: equipment }) => (
                            <View style={{ padding: 5, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                <View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row", justifyContent: "space-between" }}>
                                    <Text>{curLang == "ar" ? equipment.AR_DESC : equipment.EN_DESC}</Text>
                                    {!isReadOnly && (<Ionicons
                                        name="trash"
                                        size={26}
                                        color="red"
                                        onPress={() => {
                                            Alert.alert(
                                                i18n.t("confirm"),
                                                i18n.t("areYouSure"),
                                                [
                                                    {
                                                        text: i18n.t("cancel"),
                                                        style: "cancel"
                                                    },
                                                    {
                                                        text: i18n.t("yes"),
                                                        onPress: () => {
                                                            const updatedActions = checkedActionsList.map((act) => {
                                                                if (act.ID === item.ID) {
                                                                    act.EQUIPMENTS = act.EQUIPMENTS.filter(eq => eq.EQ_NO !== equipment.EQ_NO);
                                                                }
                                                                return act;
                                                            });
                                                            setCheckedActionsList(updatedActions);
                                                        }
                                                    }
                                                ]
                                            );
                                        }}
                                    />)}
                                </View>
                                {equipment.isEmpty && (
                                    <Text style={{ color: 'red', marginTop: 5 }}>{i18n.t("isEmpty")}</Text>
                                )}
                                {equipment.notes && (
                                    <Text style={{ marginTop: 5, fontStyle: 'italic' }}>
                                        {i18n.t("notes")}: {equipment.notes}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: Platform.OS == "ios" ? 0.5 : 0, borderColor: "black", padding: 5, borderRadius: 5 }}>
                            <Text style={{ marginRight: 10 }}>{i18n.t("done")}</Text>
                            <RadioButton
                                value="done"
                                disabled={isReadOnly}
                                uncheckedColor="gray"
                                status={checkedActionsList.find(act => act.ID === item.ID)?.IS_CHECKED ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    // Check if action exists in checkedActionsList
                                    const actionExists = checkedActionsList.some(act => act.ID == item.ID);

                                    if (actionExists) {
                                        // Update existing action
                                        const list = checkedActionsList.map((act) => {
                                            if (act.ID == item.ID) {
                                                act.IS_CHECKED = !act.IS_CHECKED;
                                                if (act.IS_CHECKED) act.EXPECTED_DATE = "";
                                            }
                                            return act;
                                        });
                                        setCheckedActionsList(list);
                                    } else {
                                        // Add new action to checkedActionsList with IS_CHECKED = true
                                        const newAction = {
                                            ID: item.ID,
                                            EN_DESC: item.EN_DESC,
                                            AR_DESC: item.AR_DESC,
                                            ATTACHMENT: "",
                                            ATTACHMENTS: [],
                                            NOTES: "",
                                            IS_CHECKED: true,
                                            EXPECTED_DATE: "",
                                            DEPARTMENT: selectedDepartment,
                                            EQUIPMENTS: []
                                        };
                                        setCheckedActionsList([...checkedActionsList, newAction]);
                                    }
                                }}
                            />
                        </View>
                        {!checkedActionsList.find(act => act.ID === item.ID)?.IS_CHECKED && (
                            <View>
                                <TouchableOpacity onPress={() => {
                                    if (isReadOnly) return;
                                    setShowDatePicker(true);
                                    setSelectedAction(item.ID);
                                }}>
                                    <TextInput
                                        placeholder={i18n.t("expectedDate")}
                                        disabled={true}
                                        value={checkedActionsList.find(act => act.ID === item.ID)?.EXPECTED_DATE}
                                        pointerEvents="none"
                                    />
                                </TouchableOpacity>
                                {showDatePicker && selectedAction === item.ID && (
                                    <DateTimePicker
                                        value={new Date()}
                                        mode="date"
                                        display="default"
                                        minimumDate={new Date()}
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                const formattedDate = moment(selectedDate).format('DD/MM/YYYY');

                                                // Check if action exists in checkedActionsList
                                                const actionExists = checkedActionsList.some(act => act.ID == item.ID);

                                                if (actionExists) {
                                                    // Update existing action
                                                    const list = checkedActionsList.map((act) => {
                                                        if (act.ID == item.ID) {
                                                            act.EXPECTED_DATE = formattedDate;
                                                        }
                                                        return act;
                                                    });
                                                    setCheckedActionsList(list);
                                                } else {
                                                    // Add new action to checkedActionsList with the expected date
                                                    const newAction = {
                                                        ID: item.ID,
                                                        EN_DESC: item.EN_DESC,
                                                        AR_DESC: item.AR_DESC,
                                                        ATTACHMENT: "",
                                                        ATTACHMENTS: [],
                                                        NOTES: "",
                                                        IS_CHECKED: false,
                                                        EXPECTED_DATE: formattedDate,
                                                        DEPARTMENT: selectedDepartment,
                                                        EQUIPMENTS: []
                                                    };
                                                    setCheckedActionsList([...checkedActionsList, newAction]);
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </View >
            </TouchableOpacity >
        )
    }


    const renderDepartmentItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    let adList = addedDepartmentsList;
                    const departmentExists = adList.some(department => department.ID === item.ID);
                    if (departmentExists) {
                        Alert.alert(i18n.t("error"), i18n.t("departmentAlreadyAdded"));
                        return;
                    }
                    setSelectedDepartment(item.ID);
                    setSelectedDepartmentEnDesc(item.EN_DESC);
                    setSelectedDepartmentArDesc(item.AR_DESC);
                    setShowAddDepartmentDialog(false);

                    // Show loading and actions modal
                    setActionsLoading(true);
                    setShowActionModal(true);

                    // Check if actions list is empty and refetch if needed
                    let currentActionsList = actionsList;
                    if (actionsList.length === 0) {
                        currentActionsList = await refetchActions();
                    }

                    // if (item.LOCATION == "" || item.LOCATION == null || item.LOCATION == undefined) {
                    //     const location = await fetchCurrentPosition()
                    //     setSelectedDepartmentLocation(location);
                    //     console.log(location)
                    // }

                    // Simulate some async processing time
                    setTimeout(() => {
                        let checkedActions = [];
                        currentActionsList.map((act) => {
                            checkedActions.push({
                                ID: act.ID,
                                EN_DESC: act.EN_DESC,
                                AR_DESC: act.AR_DESC,
                                ATTACHMENT: "",
                                ATTACHMENTS: [],
                                NOTES: "",
                                IS_CHECKED: false,
                                EXPECTED_DATE: "",
                                DEPARTMENT: item.ID
                            });
                        })
                        setCheckedActionsList(checkedActions);
                        setActionsLoading(false);
                    }, 500);
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        padding: 15,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        marginBottom: 5

                    }}
                >
                    <Text style={{ marginRight: 20, color: "red" }}>
                        {item.ID}
                    </Text>
                    {curLang == "en" && (<Text>{item.EN_DESC}</Text>)}
                    {curLang == "ar" && (<Text>{item.AR_DESC}</Text>)}
                </View>
            </TouchableOpacity>
        )
    }
    const renderReqDepartmentItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    const existingDepartment = reqDetailsDepartments.find(dept => dept.ID === item.ID);
                    if (!existingDepartment) {
                        setReqDetailsDepartments([...reqDetailsDepartments, {
                            ID: item.ID,
                            EN_DESC: item.EN_DESC,
                            AR_DESC: item.AR_DESC
                        }]);
                    }
                    setShowAddReqDepartmentDialog(false);
                    setShowReqActionModal(true);
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        padding: 15,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        marginBottom: 5

                    }}
                >
                    <Text style={{ marginRight: 20, color: "red" }}>
                        {item.ID}
                    </Text>
                    {curLang == "en" && (<Text>{item.EN_DESC}</Text>)}
                    {curLang == "ar" && (<Text>{item.AR_DESC}</Text>)}
                </View>
            </TouchableOpacity>
        )
    }
    const renderAddDepartmentItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    setSelectedDepartment(item.ID);
                    setSelectedDepartmentEnDesc(item.EN_DESC);
                    setSelectedDepartmentArDesc(item.AR_DESC);
                    setCheckedActionsList(item.ACTIONS);
                    console.log(item);

                    // Show loading and actions modal
                    setActionsLoading(true);
                    setShowActionModal(true);

                    // Simulate loading time for actions preparation
                    setTimeout(() => {
                        setActionsLoading(false);
                    }, 300);
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 15,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        marginBottom: 5
                    }}
                >
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ marginRight: 20, color: "red" }}>
                            {item.ID}
                        </Text>
                        {curLang == "en" && (<Text>{item.EN_DESC}</Text>)}
                        {curLang == "ar" && (<Text>{item.AR_DESC}</Text>)}
                    </View>
                    {!isReadOnly && (<Ionicons
                        name="trash"
                        size={26}
                        color="red"
                        onPress={() => {
                            Alert.alert(
                                i18n.t("confirm"),
                                i18n.t("areYouSure"),
                                [
                                    {
                                        text: i18n.t("cancel"),
                                        style: "cancel"
                                    },
                                    {
                                        text: i18n.t("yes"),
                                        onPress: () => {
                                            const updatedList = addedDepartmentsList.filter(dept => dept.ID !== item.ID);
                                            setAddedDepartmentsList(updatedList);
                                        }
                                    }
                                ]
                            );
                        }}
                    />)}
                </View>
            </TouchableOpacity>

        )
    }

    const renderRequestsAddDepartmentItem = ({ item }) => {
        return (
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 15,
                    borderWidth: 0.5,
                    borderRadius: 5,
                    marginBottom: 5
                }}
            >
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ marginRight: 20, color: "red" }}>
                        {item.ID}
                    </Text>
                    {curLang == "en" && (<Text>{item.EN_DESC}</Text>)}
                    {curLang == "ar" && (<Text>{item.AR_DESC}</Text>)}
                </View>
                {!isReadOnly && (<Ionicons
                    name="trash"
                    size={26}
                    color="red"
                    onPress={() => {
                        Alert.alert(
                            i18n.t("confirm"),
                            i18n.t("areYouSure"),
                            [
                                {
                                    text: i18n.t("cancel"),
                                    style: "cancel"
                                },
                                {
                                    text: i18n.t("yes"),
                                    onPress: () => {
                                        const updatedList = reqDetailsDepartments.filter(dept => dept.ID !== item.ID);
                                        setReqDetailsDepartments(updatedList);
                                    }
                                }
                            ]
                        );
                    }}
                />)}
            </View>
        )
    }

    const renderAddReqActionModal = () => {
        return (
            <Modal visible={showReqActionModal} onDismiss={() => setShowReqActionModal(false)} contentContainerStyle={styles.modalStyle}>
                <TextInput
                    placeholder={i18n.t("search")}
                    clearButtonMode="always"
                    style={styles.searchBox}
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        const list = Commons.handleSearch(text, requestsList);
                        setFilteredRequestsList(list);
                    }}
                />
                <Text style={styles.modalTitle}>
                    {i18n.t("requests")}
                </Text>
                <FlatList
                    keyExtractor={(item) => item.ID}
                    data={filteredRequestsList}
                    extraData={filteredRequestsList}
                    renderItem={renderRequestItem}
                />
                <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => setShowReqActionModal(false)}>
                    <Text style={styles.text}>{i18n.t("back")}</Text>
                </Button>
            </Modal>
        );
    };

    const renderReqDetailsModal = () => {
        return (
            <Modal visible={showReqDetailsModal} onDismiss={() => { setShowReqDetailsModal(false) }} contentContainerStyle={styles.modalStyle} >
                <Text style={styles.modalTitle}>
                    {i18n.t("requestDetails")}
                </Text>
                {!isReadOnly && (<AttachmentPicker onAttachmentSelected={(attachment) => {
                    setReqDetailsAttachment(attachment);
                }} />)}
                {
                    reqDetailsAttachment != "" && (<View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row" }}>
                        {/* <Text>
                            {i18n.t("attached")} {" : "}
                        </Text> */}
                        <TouchableOpacity onPress={() => handleAttachmentPress(reqDetailsAttachment)}>
                            <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                                {reqDetailsAttachment}
                            </Text>
                        </TouchableOpacity>
                    </View>)
                }
                <TextInput
                    label={selectedRequestHint != "" ? selectedRequestHint : i18n.t("notes")}
                    multiline={true}
                    value={reqDetailsNotes}
                    onChangeText={setReqDetailsNotes}
                />
                <TouchableOpacity style={{ flexDirection: curLang == "ar" ? 'row' : 'row-reverse', marginVertical: 5, justifyContent: "space-between", backgroundColor: Constants.appColor, padding: 10, width: "100%" }} onPress={() => {
                    setShowAddReqDepartmentDialog(true);
                }}>
                    <Ionicons name="add-circle-outline" size={26} color="white" />
                    <Text style={{ textAlign: "flex-end", fontSize: 16, color: "white", fontWeight: "bold" }}>
                        {i18n.t("departments")}
                    </Text>
                </TouchableOpacity>
                <FlatList
                    keyExtractor={(item) => item.ID}
                    data={reqDetailsDepartments}
                    extraData={reqDetailsDepartments}
                    renderItem={renderRequestsAddDepartmentItem}
                />

                <TouchableOpacity style={{ flexDirection: curLang == "ar" ? 'row' : 'row-reverse', marginVertical: 5, justifyContent: "space-between", backgroundColor: Constants.darkBlueColor, padding: 10, width: "100%" }} onPress={() => {
                    if (!isReadOnly) {
                        setFilteredEquipmentsList(defaultEquipmentsList);
                        setShowReqEquipmentsModal(true);
                        setSelectedReqEquipments(reqDetailsEquipments);
                    }
                }}>
                    <Ionicons name="add-circle-outline" size={26} color="white" />
                    <Text style={{ textAlign: "flex-end", fontSize: 16, color: "white", fontWeight: "bold" }}>
                        {i18n.t("equipments")}
                    </Text>
                </TouchableOpacity>
                <FlatList
                    keyExtractor={(equipment) => equipment.EQ_NO}
                    data={reqDetailsEquipments}
                    style={{ marginVertical: 10 }}
                    renderItem={({ item: equipment }) => (
                        <View style={{ padding: 5, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                            <View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row", justifyContent: "space-between" }}>
                                <Text>{curLang == "ar" ? equipment.AR_DESC : equipment.EN_DESC}</Text>
                                {!isReadOnly && (
                                    <Ionicons
                                        name="trash"
                                        size={26}
                                        color="red"
                                        onPress={() => {
                                            Alert.alert(
                                                i18n.t("confirm"),
                                                i18n.t("areYouSure"),
                                                [
                                                    {
                                                        text: i18n.t("cancel"),
                                                        style: "cancel"
                                                    },
                                                    {
                                                        text: i18n.t("yes"),
                                                        onPress: () => {
                                                            const updatedEquipments = reqDetailsEquipments.filter(eq => eq.EQ_NO !== equipment.EQ_NO);
                                                            setReqDetailsEquipments(updatedEquipments);
                                                        }
                                                    }
                                                ]
                                            );
                                        }}
                                    />
                                )}
                            </View>
                            {equipment.isEmpty && (
                                <Text style={{ color: 'red', marginTop: 5 }}>{i18n.t("isEmpty")}</Text>
                            )}
                            {equipment.notes && (
                                <Text style={{ marginTop: 5, fontStyle: 'italic' }}>
                                    {i18n.t("notes")}: {equipment.notes}
                                </Text>
                            )}
                        </View>
                    )}
                />

                {!showReqEquipmentsModal && (
                    <View style={{ flexDirection: "row" }}>
                        <Button mode="contained" style={{ borderRadius: 0, flex: isReadOnly ? 1 : 0.5, marginHorizontal: 2 }} onPress={() => { setShowReqDetailsModal(false) }}>
                            <Text style={styles.text}>{i18n.t("back")}</Text>
                        </Button>
                        {!isReadOnly && (<Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => {
                            const valid = addReqActionValidations();
                            if (!valid) return;
                            const existingRequestIndex = addedRequestsList.findIndex(req => req.ID === selectedRequest);
                            const newRequest = {
                                ID: selectedRequest,
                                EN_DESC: selectedRequestDesc,
                                AR_DESC: selectedRequestDesc,
                                ATTACHMENT: reqDetailsAttachment,
                                NOTES: reqDetailsNotes,
                                DEPARTMENTS: reqDetailsDepartments,
                                EQUIPMENTS: reqDetailsEquipments,
                            };
                            if (existingRequestIndex !== -1) {
                                const updatedRequestsList = [...addedRequestsList];
                                updatedRequestsList[existingRequestIndex] = newRequest;
                                setAddedRequestsList(updatedRequestsList);
                            } else {
                                setAddedRequestsList([...addedRequestsList, newRequest]);
                            }
                            setShowReqDetailsModal(false);
                            setShowReqActionModal(false)
                            setSelectedRequest("");
                            setSelectedRequestDesc("");
                            setSelectedRequestHint("");
                            setSelectedRequestNotesRequired("");
                            setReqDetailsAttachment("");
                            setReqDetailsNotes("");
                            setReqDetailsDepartments([]);
                            setReqDetailsEquipments([]);
                        }}>
                            <Text style={styles.text}>{i18n.t("save")}</Text>
                        </Button>)}
                    </View>
                )}
            </Modal >
        );
    };

    const renderRequestItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    const existingRequest = addedRequestsList.find(req => req.ID === item.ID);
                    // if (existingRequest) {
                    //     Alert.alert(i18n.t("error"), i18n.t("requestAlreadyAdded"));
                    //     return;
                    // }
                    setSelectedRequest(item.ID);
                    setSelectedRequestDesc(curLang == "en" ? item.EN_DESC : item.AR_DESC);
                    setSelectedRequestHint(item.HINT);
                    setSelectedRequestNotesRequired(item.NOTES_REQUIRED);
                    setReqDetailsAttachment("");
                    setReqDetailsNotes("");
                    setReqDetailsDepartments([]);
                    setReqDetailsEquipments([]);
                    setShowReqActionModal(false);
                    setShowReqDetailsModal(true);
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        padding: 15,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        marginBottom: 5
                    }}
                >
                    <Text style={{ marginRight: 20, color: "red" }}>
                        {item.ID}
                    </Text>
                    {curLang == "en" && (<Text>{item.EN_DESC}</Text>)}
                    {curLang == "ar" && (<Text>{item.AR_DESC}</Text>)}
                </View>
            </TouchableOpacity>
        );
    };

    const renderAddedRequestItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedRequest(item.ID);
                    setSelectedRequestDesc(curLang == "en" ? item.EN_DESC : item.AR_DESC);
                    setReqDetailsAttachment(item.ATTACHMENT);
                    setReqDetailsNotes(item.NOTES);
                    setReqDetailsDepartments(item.DEPARTMENTS);
                    setReqDetailsEquipments(item.EQUIPMENTS || []);
                    setShowReqDetailsModal(true);
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 15,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        marginBottom: 5
                    }}
                >
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ marginRight: 20, color: "red" }}>
                            {item.ID}
                        </Text>
                        <Text>{curLang == "ar" ? item.AR_DESC : item.EN_DESC}</Text>
                    </View>
                    {!isReadOnly && (<Ionicons
                        name="trash"
                        size={26}
                        color="red"
                        onPress={() => {
                            Alert.alert(
                                i18n.t("confirm"),
                                i18n.t("areYouSure"),
                                [
                                    {
                                        text: i18n.t("cancel"),
                                        style: "cancel"
                                    },
                                    {
                                        text: i18n.t("yes"),
                                        onPress: () => {
                                            const updatedList = addedRequestsList.filter(req => req.ID !== item.ID);
                                            setAddedRequestsList(updatedList);
                                        }
                                    }
                                ]
                            );
                        }}
                    />)}
                </View>
            </TouchableOpacity>
        );
    };

    const renderCustomerVisitsModal = () => {
        return (
            <Modal visible={showCustomerVisitsModal} onDismiss={() => setShowCustomerVisitsModal(false)} contentContainerStyle={styles.modalStyle}>
                <Text style={styles.modalTitle}>
                    {i18n.t("visits")}
                </Text>
                <TextInput
                    placeholder={i18n.t("search")}
                    clearButtonMode="always"
                    style={styles.searchBox}
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        const filteredList = Commons.handleSearch(text, customerVisits);
                        setFilteredCustomerVisits(filteredList);
                    }}
                />
                <FlatList
                    keyExtractor={(item) => item.VISIT_ID}
                    data={filteredCustomerVisits}
                    extraData={filteredCustomerVisits}
                    renderItem={({ item }) => (

                        <TouchableOpacity onPress={async () => {
                            Alert.alert(
                                i18n.t("confirm"),
                                i18n.t("gotoVisitConfirmation"),
                                [
                                    {
                                        text: i18n.t("cancel"),
                                        style: "cancel"
                                    },
                                    {
                                        text: i18n.t("yes"),
                                        onPress: async () => {
                                            setShowCustomerVisitsModal(false);
                                            navigation.push("NewVisit", { custID: selectedCust, custName: selectedCustName, phone: selectedCustPhone, visitID: item.VISIT_ID });
                                        }
                                    }
                                ]
                            );
                        }} style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}>
                            <Text style={{ color: "red", alignSelf: 'center' }}>{item.VISIT_ID}</Text>
                            <Text>{i18n.t("date")}: {item.DATE}</Text>
                            <Text>{i18n.t("time")}: {item.TIME}</Text>
                            <Text>{i18n.t("username")}: {item.USER}</Text>
                            {!isHygex && !isNotesVisit && (<View><Text>{i18n.t("type")}: {item.TYPE}</Text>
                                <Text style={styles.rowText}>{i18n.t("visitcall")}: {item.VISIT_CALL}</Text></View>)}
                            {item.VISIT_CALL == "Call" && (<Text style={styles.rowText}>{i18n.t("callDuration")}: {item.CALL_DURATION}</Text>)}
                        </TouchableOpacity>
                    )}
                />
                <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => setShowCustomerVisitsModal(false)}>
                    <Text style={styles.text}>{i18n.t("back")}</Text>
                </Button>
            </Modal>
        );
    };

    const renderContactsModal = () => {
        return (
            <CustomerContacts
                contactsList={contactsList}
                setContactsList={setContactsList}
                customer={selectedCust}
                customerType="Existing"
                visible={showContactsModal}
                onDismiss={() => setShowContactsModal(false)}
                curLang={curLang}
            />
        );
    };
    const renderBussinessTypeModal = () => {
        return (
            <Modal visible={showBusinessTypeModal} onDismiss={() => setShowBusinessTypeModal(false)} contentContainerStyle={styles.modalStyle}>
                <View>
                    <Text style={styles.modalTitle}>
                        {i18n.t("changeCustomerBusinessType")}
                    </Text>
                    <View style={[styles.taskItemView(curLang), { marginHorizontal: 0 }]}>
                        <Text style={[styles.text2(curLang), { color: "black" }]}>{i18n.t("businessType")} {" : "}</Text>
                        <View>
                            <DropDownPicker
                                open={businessTypeOpen}
                                value={selectedCustBusinessType}
                                items={businessTypesList.map(businessType => ({
                                    label: curLang === "en" ? businessType.EN_DESC : businessType.AR_DESC,
                                    value: businessType.ID
                                }))}
                                setOpen={setBusinessTypeOpen}
                                setValue={setSelectedCustBusinessType}
                                disabled={isReadOnly}
                                searchable={true}
                                listMode="SCROLLVIEW"
                                scrollViewProps={{
                                    nestedScrollEnabled: true,
                                }}

                                placeholder={i18n.t("businessType")}
                                style={[styles.dropdownStyle, {
                                    backgroundColor: isReadOnly ? "#f5f5f5" : "white"
                                }]}
                                zIndex={1000}
                                zIndexInverse={1000}
                                dropDownContainerStyle={[styles.dropdownContainer, { position: "relative", top: 0 }]}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: "row-reverse" }}>
                        <Button mode="contained" icon="content-save" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={async () => {
                            const response = await ServerOperations.changeCustomerBusinessType(selectedCust, selectedCustBusinessType);
                            if (response.res) {
                                Alert.alert(i18n.t("success"), i18n.t("businessTypeUpdated"));
                            } else {
                                Alert.alert(i18n.t("error"), i18n.t("businessTypeUpdateFailed"));
                            }
                        }}>
                            <Text style={styles.text}>{i18n.t("save")}</Text>
                        </Button>
                        <Button mode="contained" icon="arrow-left" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => setShowBusinessTypeModal(false)}>
                            <Text style={styles.text}>{i18n.t("back")}</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        );
    };
    return (
        [<Portal key="addDepartmentDialog">{showAddDepartmentDialog && renderAddDepartmentDialog()}</Portal>,
        <Portal key="reqActionModal">{showReqActionModal && renderAddReqActionModal()}</Portal>,
        <Portal key="reqDetailsModal">{showReqDetailsModal && renderReqDetailsModal()}</Portal>,
        <Portal key="addReqDepartmentDialog">{showAddReqDepartmentDialog && renderAddReqDepartmentDialog()}</Portal>,
        <Portal key="addActionModal">{showAddActionModal && renderAddActionModal()}</Portal>,
        <Portal key="equipmentsModal">{showEquipmentsModal && renderEquipmentsModal()}</Portal>,
        <Portal key="reqEquipmentsModal">{showReqEquipmentsModal && renderReqEquipmentsModal()}</Portal>,
        <Portal key="customerEquipmentsModal">{showCustomerEquipmentsModal && renderCustomerEquipmentsModal()}</Portal>,
        // <Portal>{imagePreviewVisible && renderImagePreviewModal()}</Portal>,
        <Portal key="contactsModal">{showContactsModal && renderContactsModal()}</Portal>,
        <Portal key="customerVisitsModal">{showCustomerVisitsModal && renderCustomerVisitsModal()}</Portal>,
        <Portal key="businessTypeModal">{showBusinessTypeModal && renderBussinessTypeModal()}</Portal>,
        <Portal key="progressDialog">{loading && <ProgressDialog visible={loading} message={loadingMessage} />}</Portal>,
        <SafeAreaView key="mainContent" style={styles.cardContainer}>

            <View style={{ backgroundColor: Constants.appColor, padding: 10, width: "100%" }}>
                <View style={{ flexDirection: curLang == "ar" ? 'row-reverse' : 'row', justifyContent: "space-between" }}>
                    <Text style={[styles.text, { marginBottom: 10, alignSelf: "center" }]}> {i18n.t("visitNo")} {" : "} {visitID}  </Text>
                    <Button icon="history" style={{ marginHorizontal: 2, marginBottom: 10 }} labelStyle={{ color: "white" }} onPress={() => setShowCustomerVisitsModal(true)}>
                        <Text style={{ fontSize: 12 }}>{i18n.t("visits")}</Text>
                    </Button>
                </View>
                <View
                    style={{
                        borderBottomColor: 'gray',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                />
                <Text style={[styles.text, { marginTop: 10, textAlign: curLang == "ar" ? "right" : "left" }]}>{i18n.t("customer")} {" : "} {selectedCustName}  </Text>
                <Text style={[styles.text, { marginTop: 10, textAlign: curLang == "ar" ? "right" : "left" }]}>{i18n.t("branch")} {" : "} {selectedCustBranch}  </Text>
                {/* <Text style={[styles.text, { marginTop: 10 }]}>{i18n.t("phone")} {" : "} {selectedCustPhone}  </Text> */}
                {!isHygex && !isNotesVisit && (
                    <View style={{ flexDirection: "row" }}>
                        <Button icon="contacts" style={{ flex: 0.5, marginHorizontal: 2 }} labelStyle={{ color: "white" }} onPress={() => {
                            setShowContactsModal(true);
                        }}>
                            <Text style={{ fontSize: 12 }}>{i18n.t("contacts")}</Text>
                        </Button>
                        <Button icon="domain" style={{ flex: 0.33, marginHorizontal: 2 }} labelStyle={{ color: "white" }} onPress={() => setShowBusinessTypeModal(true)}>
                            <Text style={{ fontSize: 12 }}>{i18n.t("businessType")}</Text>
                        </Button>
                        <Button icon="tools" style={{ flex: 0.5, marginHorizontal: 2 }} labelStyle={{ color: "white" }} onPress={() => setShowCustomerEquipmentsModal(true)}>
                            <Text style={{ fontSize: 12 }}>{i18n.t("equipments")}</Text>
                        </Button>
                    </View>
                )}


            </View>
            {!isHygex && !isNotesVisit && (
                <View style={[styles.taskItemView(curLang)]}>
                    <Text style={styles.text2(curLang)}>{i18n.t("visitcall")} {" : "}</Text>
                    <View>
                        <DropDownPicker
                            open={visitCallOpen}
                            value={selectedType}
                            items={visitCallItems}
                            setOpen={setVisitCallOpen}
                            setValue={setSelectedType}
                            setItems={setVisitCallItems}
                            disabled={isReadOnly}
                            placeholder={i18n.t("chooseAction")}
                            style={[styles.dropdownStyle, {
                            }]}
                            textStyle={{ color: selectedType === "" ? "gray" : "black" }}
                            dropDownContainerStyle={styles.dropdownContainer}
                            onChangeValue={async (value) => {
                                if (addedDepartmentsList.length > 0) {
                                    // Alert.alert(i18n.t("error"), i18n.t("cantChangeTypeIfDepartmentsAdded"));
                                    setSelectedType(selectedType); // Reset to previous value
                                    return;
                                }
                                if (value === "Call") {
                                    openDialer(selectedCustPhone);
                                } else {
                                    setCallDuration("");
                                    setCallEnded(false);
                                }
                            }}
                            zIndex={3000}
                            zIndexInverse={1000}
                        />
                    </View>
                </View>
            )}
            {!isHygex && !isNotesVisit && selectedType == "Call" && (<View style={{ alignSelf: "center" }}>
                {!callEnded && (<Button
                    onPress={() => {
                        calculateCallDuration();
                    }}
                    mode="contained"
                    color="red"
                    style={{ width: width / 2.5 }}
                > {i18n.t("endCall")} </Button>)}
                {callEnded && (
                    <Text style={styles.text3}>
                        {i18n.t("callDuration")}{":"} {callDuration}
                    </Text>
                )}

            </View>)}

            {!isHygex && !isNotesVisit && (
                <View style={styles.taskItemView(curLang)}>
                    <Text style={styles.text2(curLang)}>{i18n.t("visitType")} {" : "}</Text>
                    <View>
                        <DropDownPicker
                            open={visitTypeOpen}
                            value={selectedVisitType}
                            items={visitTypeItems}
                            setOpen={setVisitTypeOpen}
                            setValue={setSelectedVisitType}
                            setItems={setVisitTypeItems}
                            disabled={isReadOnly}
                            style={[styles.dropdownStyle, {
                                backgroundColor: isReadOnly ? "#f5f5f5" : "white"
                            }]}

                            dropDownContainerStyle={styles.dropdownContainer}
                            zIndex={2000}
                            zIndexInverse={2000}
                        />
                    </View>
                </View>
            )}

            {!isHygex && !isNotesVisit && (
                <>
                    <TouchableOpacity style={{
                        flexDirection: curLang == "ar" ? 'row' : 'row-reverse',
                        justifyContent: "space-between",
                        backgroundColor: selectedType == "Request" ? "#ccc" : Constants.appColor,
                        padding: 10,
                        width: "100%",
                        opacity: selectedType == "Request" ? 0.6 : 1
                    }} onPress={async () => {
                        if (!isReadOnly) {
                            if (selectedType == "") {
                                Alert.alert(i18n.t("error"), i18n.t("selectVisitCall"));
                                return;
                            }
                            if (selectedType == "Request") {
                                Alert.alert(i18n.t("error"), i18n.t("cannotAddDepartmentsForRequest"));
                                return;
                            }

                            // Check if departments list is empty and refetch if needed
                            if (departmentsList.length === 0) {
                                const success = await refetchDepartments();
                                if (!success) return;
                            } else {
                                console.log('Departments already loaded:', departmentsList.length);
                            }

                            setShowAddDepartmentDialog(true);
                        }
                    }}>
                        <Ionicons name="add-circle-outline" size={26} color={selectedType == "Request" ? "#888" : "white"} />
                        <Text style={{
                            textAlign: "flex-end",
                            fontSize: 16,
                            color: selectedType == "Request" ? "#888" : "white",
                            fontWeight: "bold"
                        }}>
                            {i18n.t("addedDepartments")}
                        </Text>
                    </TouchableOpacity>
                    <FlatList
                        keyExtractor={(item) => item.ID}
                        data={addedDepartmentsList}
                        extraData={addedDepartmentsList}
                        style={styles.flatList}
                        renderItem={renderAddDepartmentItem}
                    />
                </>
            )}

            {!isHygex && !isNotesVisit && (
                <>
                    <TouchableOpacity style={{ flexDirection: curLang == "ar" ? 'row' : 'row-reverse', justifyContent: "space-between", backgroundColor: Constants.appColor, padding: 10, width: "100%" }} onPress={async () => {
                        if (!isReadOnly) {
                            // Check if requests list is empty and refetch if needed
                            if (requestsList.length === 0) {
                                const success = await refetchRequestActions();
                                if (!success) return;
                            } else {
                                console.log('Requests already loaded:', requestsList.length);
                            }

                            setShowReqActionModal(true);
                        }
                    }}>
                        <Ionicons name="add-circle-outline" size={26} color="white" />
                        <Text style={{ textAlign: "flex-end", fontSize: 16, color: "white", fontWeight: "bold" }}>
                            {i18n.t("addedRequests")}
                        </Text>
                    </TouchableOpacity>
                    <FlatList
                        keyExtractor={(item) => item.ID}
                        data={addedRequestsList}
                        extraData={addedRequestsList}
                        style={styles.flatList}
                        renderItem={renderAddedRequestItem}
                    />
                </>
            )}

            {isNotesVisit && (
                <View style={{ marginTop: 20 }}>
                    <TextInput
                        placeholder={i18n.t("notes")}
                        multiline={true}
                        value={visitNotes}
                        onChangeText={setVisitNotes}
                        style={{ minHeight: 100, marginBottom: 10 }}
                        textAlign="left"
                        textAlignVertical="top"
                        disabled={isReadOnly}
                    />

                    {!isReadOnly && (
                        <View style={{ marginBottom: 10 }}>
                            <AttachmentPicker onAttachmentSelected={(attachment) => {
                                setVisitAttachments([...visitAttachments, attachment]);
                            }} />

                        </View>
                    )}

                    {visitAttachments.length > 0 && (
                        <ScrollView style={{ marginTop: 10, maxHeight: 150 }} nestedScrollEnabled={true}>
                            {visitAttachments.map((attachment, index) => (
                                <View key={index} style={{
                                    flexDirection: curLang == "ar" ? "row-reverse" : "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 5,
                                    padding: 8,
                                    borderWidth: 0.5,
                                    borderColor: "#ccc",
                                    borderRadius: 5,
                                    backgroundColor: "#f9f9f9"
                                }}>
                                    <TouchableOpacity
                                        onPress={() => handleAttachmentPress(attachment)}
                                        style={{ flex: 1 }}
                                    >
                                        <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                                            {attachment}
                                        </Text>
                                    </TouchableOpacity>
                                    {!isReadOnly && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                const updatedAttachments = visitAttachments.filter((_, i) => i !== index);
                                                setVisitAttachments(updatedAttachments);
                                            }}
                                            style={{ marginLeft: 10 }}
                                        >
                                            <Ionicons name="trash" size={20} color="red" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {
                !isReadOnly && (<Button style={{ marginTop: 20, marginBottom: 20 }} mode="contained" icon={isHygex ? "clock-time-four" : "content-save"} onPress={saveVisit} >
                    <Text style={styles.text}>{isHygex ? i18n.t("checkInOut") : i18n.t("saveVisit")}</Text>
                </Button>)
            }
            {
                isReadOnly && (
                    <Button mode="contained" icon={({ size, color }) => (
                        <Ionicons name="arrow-back" size={size} color={color} />
                    )} style={{}} onPress={async () => {
                        navigation.goBack();
                    }}>
                        <Text style={styles.text}>{i18n.t("back")}</Text>
                    </Button>
                )
            }
        </SafeAreaView >]
    );
}
const styles = StyleSheet.create({
    dropdownStyle: {
        width: width / 1.7,  // Changed from width / 2.5
        borderColor: '#ccc',
        borderWidth: 1,
    },
    dropdownContainer: {
        width: width / 1.7,  // Added width to match dropdown
        borderColor: '#ccc',
        borderWidth: 1,

    },
    viewContainer: {
        width: "80%",
        marginTop: 80,
    },
    addButtonStyle: { color: "white" },
    text: { color: "white", fontWeight: "bold", fontSize: 16 },
    text2: curLang => ({
        fontWeight: "bold",
        fontSize: 16,
        alignSelf: "center",
        minWidth: width / 3.3,  // Add fixed minimum width for text
        textAlign: curLang == "ar" ? "right" : "left"
    }),
    text3: { fontSize: 14, marginHorizontal: 5, alignSelf: "center" },
    taskItemView: curLang => ({
        flexDirection: curLang == "ar" ? "row-reverse" : "row",
        marginHorizontal: 10,
        marginVertical: 5,
    }),
    cardContainer: {
        display: "flex",
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 10,
    },
    modalStyle: {
        backgroundColor: "white",
        padding: 20,
        maxHeight: height - 50,
    },
    loginButtonStyle: {
        margin: 2,
        marginLeft: 0,
        marginRight: 0,
    },

    loginButtonContainer: {
        margin: 15,
        width: "100%",
        paddingTop: 15,
        alignSelf: "center",
    },
    image: {
        width: 160,
        height: 195,
        margin: 45,
        marginTop: 40,
        alignSelf: "center",
    },
    appButtonContainer: {
        backgroundColor: "#FF0000",
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    cardTitle: {
        color: "#A91B0D",
    },
    appButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase",
    },
    searchBox: {
        borderColor: "#ccc",
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
        textAlign: "center",
        backgroundColor: "#ececec"
    },
    card: {
        alignItems: "flex-start",
        marginBottom: 12,
        backgroundColor: Color.GREY[50],
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Color.GREY[500],
        padding: 15
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: Constants.darkBlueColor,
        borderRadius: 5,
        width: "70%",
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    previewContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    previewImage: {
        width: height / 1.5,
        height: width / 1.5,
        resizeMode: "contain",
    },
    flatList: {
        marginTop: 10,
        maxHeight: height / 3.5,
    },
    progressDialogContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
    },
    progressDialogMessage: {
        fontSize: 16,
        marginLeft: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Constants.darkBlueColor,
    },
    modalTitle: { textAlign: "center", fontSize: 16, backgroundColor: Constants.appColor, color: "white", fontWeight: "bold", padding: 10, width: "100%" }
});
