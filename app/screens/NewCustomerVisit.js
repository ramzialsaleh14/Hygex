import React, { useState, useEffect } from "react";
import { Button, Modal, Portal, TextInput, RadioButton } from "react-native-paper";
import * as ServerOperations from "../utils/ServerOperations";
import * as Commons from "../utils/Commons";
import * as Constants from "../utils/Constants";
import { Ionicons } from "@expo/vector-icons";
import Color from 'react-native-material-color';
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { Camera, useCameraPermissions } from "expo-camera";
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
    KeyboardAvoidingView,
} from "react-native";
import i18n from "../languages/langStrings";
import ProgressDialog from '../components/ProgressDialog';
import { height, width } from "../utils/Styles";
import moment from 'moment';
import CustomerContacts from '../components/CustomerContacts';
import DropDownPicker from 'react-native-dropdown-picker';



TouchableOpacity.defaultProps = { activeOpacity: 0.8 };

const AppButton = ({ onPress, title }) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);
export const NewCustomerVisitScreen = ({ route, navigation }) => {
    //**Variables**//
    const [singleFile, setSingleFile] = useState("");
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [curLang, setCurLang] = useState("");

    // Missing state variables
    const [selectedType, setSelectedType] = useState("");
    const [selectedVisitType, setSelectedVisitType] = useState("First Visit");
    const [selectedCust, setSelectedCust] = useState("");
    const [selectedCustName, setSelectedCustName] = useState("");
    const [selectedCustPhone, setSelectedCustPhone] = useState("");
    const [customerType, setCustomerType] = useState("");
    const [pendingVisitId, setPendingVisitId] = useState("");
    const [empType, setEmpType] = useState("");
    const [curUser, setCurUser] = useState("");
    const [visitID, setVisitID] = useState("");
    const [callDuration, setCallDuration] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [startLocation, setStartLocation] = useState("");
    const [startTime, setStartTime] = useState("");
    const [visitStartTime, setVisitStartTime] = useState("");
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [ignoreLoc, setIgnoreLoc] = useState(false);
    const [callStartTime, setCallStartTime] = useState(null);
    const [customerStatus, setCustomerStatus] = useState("keepAsPending");
    const [discardReason, setDiscardReason] = useState("");
    const [loadingMessage, setLoadingMessage] = useState("");
    const [showEditCustomerButton, setShowEditCustomerButton] = useState(false);
    const [addedDepartmentsList, setAddedDepartmentsList] = useState([]);
    const [businessTypesList, setBusinessTypesList] = useState([]);
    const [businessTypeItems, setBusinessTypeItems] = useState([]);
    const [customerVisits, setCustomerVisits] = useState([]);
    const [filteredCustomerVisits, setFilteredCustomerVisits] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [filteredDepartmentsList, setFilteredDepartmentsList] = useState([]);
    const [actionsList, setActionsList] = useState([]);
    const [selectedCustBusinessType, setSelectedCustBusinessType] = useState("");
    const [contactsList, setContactsList] = useState([]);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imageUri, setImageUri] = useState("");
    const [showAddDepartmentDialog, setShowAddDepartmentDialog] = useState(false);
    const [showReqActionModal, setShowReqActionModal] = useState(false);
    const [showReqDetailsModal, setShowReqDetailsModal] = useState(false);
    const [showAddReqDepartmentDialog, setShowAddReqDepartmentDialog] = useState(false);
    const [showAddActionModal, setShowAddActionModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showCloseVisitModal, setShowCloseVisitModal] = useState(false);
    const [showCustomerVisitsModal, setShowCustomerVisitsModal] = useState(false);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedDepartmentEnDesc, setSelectedDepartmentEnDesc] = useState("");
    const [selectedDepartmentArDesc, setSelectedDepartmentArDesc] = useState("");
    const [checkedActionsList, setCheckedActionsList] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedAction, setSelectedAction] = useState("");
    const [reqDetailsNotes, setReqDetailsNotes] = useState("");
    const [selectedRequestNotesRequired, setSelectedRequestNotesRequired] = useState("");
    const [reqDetailsAttachment, setReqDetailsAttachment] = useState("");
    const [reqDetailsDepartment, setReqDetailsDepartment] = useState("");
    const [reqDetailsDepartmentName, setReqDetailsDepartmentName] = useState("");

    // Dropdown states
    const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
    const [visitCallOpen, setVisitCallOpen] = useState(false);
    const [visitTypeOpen, setVisitTypeOpen] = useState(false);
    const [visitCallItems, setVisitCallItems] = useState([
        { label: i18n.t("visit"), value: "Visit" },
        { label: i18n.t("call"), value: "Call" },
        { label: i18n.t("openAccount"), value: "Open Account" },
        { label: i18n.t("priceOffer"), value: "Price Offer" },

    ]);
    const [visitTypeItems, setVisitTypeItems] = useState([
        { label: i18n.t("firstVisit"), value: "First Visit" },
        { label: i18n.t("demo"), value: "Demo" },
        { label: i18n.t("offer"), value: "Offer" }
    ]);

    // Phase loading states
    const [totalSteps, setTotalSteps] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    // Helper function for phase messages
    const setPhaseMessage = (phases, currentPhase) => {
        const stepIndex = phases.indexOf(currentPhase);
        if (stepIndex !== -1) {
            setCurrentStep(stepIndex + 1);
            setLoadingMessage(i18n.t("loading"));
        }
    };
    useEffect(() => {
        (async () => {
            setLoading(true);
            const curLang = await Commons.getFromAS("lang");
            const curUser = await Commons.getFromAS("userID");
            const type = await Commons.getFromAS("type");
            setEmpType(type);
            setCurUser(curUser);
            setCurLang(curLang);
            setSelectedCust(route.params.custID);
            setSelectedCustName(route.params.custName);
            setSelectedCustPhone(route.params.phone);
            setCustomerType(route.params.customerType);
            setPendingVisitId(route.params.pendingVisitId);
            const res2 = await ServerOperations.getBusinessTypes();
            if (res2) {
                setBusinessTypesList(res2);
                const businessTypeDropdownItems = res2.map(businessType => ({
                    label: curLang === "en" ? businessType.EN_DESC : businessType.AR_DESC,
                    value: businessType.ID
                }));
                setBusinessTypeItems(businessTypeDropdownItems);
            }
            const visits = await ServerOperations.getCustomerVisits(route.params.custID, "Potential");
            if (visits) {
                setCustomerVisits(visits);
                setFilteredCustomerVisits(visits);
            }
            const deps = await ServerOperations.getDepartments();
            if (deps) {
                setDepartmentsList(deps);
                setFilteredDepartmentsList(deps);
            }
            const acts = await ServerOperations.getActions(type, 'Potential');
            if (acts) {
                setActionsList(acts);
            }
            if (route.params.visitID && route.params.visitID !== "") {
                setVisitID(route.params.visitID);
                const res = await ServerOperations.getVisitDetails(route.params.visitID);
                const currentDate = moment().format('DD/MM/YYYY');
                const canEditRes = await ServerOperations.canEditVisit(route.params.visitID, curUser, currentDate);
                if (res) {
                    setAddedDepartmentsList(res.DEPARTMENTS);
                    setSelectedVisitType(res.TYPE);
                    setCallDuration(res.CALL_DURATION);
                    if (res.CALL_DURATION && res.CALL_DURATION !== "null") { setCallEnded(true); } else { setCallEnded(false); }
                    setSelectedType(res.VISIT_CALL);
                    // setStartLocation(res.START_LOCATION);
                    setStartTime(res.START_TIME);
                    if (res.START_TIME) setVisitStartTime(res.START_TIME);
                    if (canEditRes.res) { setIsReadOnly(false); setIgnoreLoc(true); } else { setIsReadOnly(true); }
                    if (res.VISIT_CALL === "Visit") await checkLocationDistance(route.params.custID);
                }
            }
            if (route.params.visitID === "") {
                setVisitID("NEW");
                setIsReadOnly(false);
            }
            if (selectedType === "Visit") {
                if (!startLocation || startLocation === "") {
                    for (let i = 0; i < 2; i++) {
                        const loc = await getCurrentLocationWithLoading();
                        if (loc) { setStartLocation(loc); break; }
                        await delay(1200);
                    }
                }
                await checkLocationDistance(route.params.custID);
            }
            setLoading(false);
        })();
    }, [selectedType]);

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



    const openDialer = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
        setCallStartTime(new Date());
    };

    const requestCallLogPermission = async () => {
        if (Platform.OS === 'android') {
            const currentPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CALL_LOG);
            console.log("perm : " + currentPermission);
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
                    {
                        title: 'Call Log Permission',
                        message: 'This app needs access to your call logs to display call duration.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can read the call logs');
                } else {
                    console.log('Call log permission denied');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const checkPotentialCustomerInfo = async () => {
        setLoadingMessage(i18n.t("loading"));
        const res = await ServerOperations.checkPotentialCustomerInfo(selectedCust);
        console.log(res.res);
        return res.RES;
    }

    const saveVisit = async () => {
        // Prevent multiple calls by checking if already loading
        if (loading) {
            return;
        }

        setLoading(true);
        setLoadingMessage(i18n.t("loading"));

        try {
            if (customerStatus == "Pending creation" || selectedType == "Open Account") {
                setLoadingMessage(i18n.t("loading"));
                //const validInfo = await checkPotentialCustomerInfo();
                const res = await ServerOperations.checkPotentialCustomerInfo(selectedCust);
                if (!res.RES) {
                    Alert.alert(i18n.t("error"), i18n.t("missingCustomerInfo") + " , " + res.reason);
                    setShowEditCustomerButton(true);
                    setLoading(false);
                    setLoadingMessage("");
                    return;
                };
            }
            if (customerStatus === "Discarded" && discardReason == "") {
                Commons.okAlert(i18n.t("error"), i18n.t("discardReasonRequired"));
                return false;
            }
            if (selectedType == "") {
                Alert.alert(i18n.t("error"), i18n.t("selectVisitCall"));
                return false;
            }

            if ((selectedType == "Visit" || selectedType == "Call") && addedDepartmentsList.length === 0) {
                Alert.alert(i18n.t("error"), i18n.t("missingDepartmentError"));
                setLoading(false);
                setLoadingMessage("");
                return false;
            }

            if (selectedType == "Call" && callDuration == null) {
                Alert.alert(i18n.t("error"), i18n.t("callNotEnded"));
                return false;
            }

            let addedDeps = [];
            addedDeps = addedDepartmentsList.map(department => ({
                ...department,
                ACTIONS: department.ACTIONS.filter(action => action.IS_CHECKED || action.EXPECTED_DATE)
            }));
            addedDeps.forEach(department => {
                department.ACTIONS.forEach(action => {
                    action.IS_CHECKED = action.IS_CHECKED ? "Y" : "N";
                });
            });

            // Ensure startLocation is set for Visit
            if (selectedType === "Visit" && (!startLocation || startLocation === "")) {
                setLoadingMessage(i18n.t("loading"));
                const startLoc = await getCurrentLocation();
                if (startLoc) setStartLocation(startLoc);
            }

            // Check distance for Visit
            let endLocation = ""
            if (selectedType === "Visit") {
                setLoadingMessage(i18n.t("loading"));
                endLocation = ''
                try { await checkLocationDistance(selectedCust); } catch (e) { console.log('Distance check failed', e); }
            }



            setLoadingMessage(i18n.t("loading"));
            const response = await ServerOperations.saveVisit(
                selectedType,
                selectedVisitType,
                callDuration,
                JSON.stringify(addedDeps),
                '',
                curUser,
                selectedCust,
                "Potential",
                visitID,
                customerStatus,
                discardReason,
                startLocation,
                endLocation,
                pendingVisitId,
                "",
                "",
                visitStartTime,
                "",
                ""
            );

            console.log(JSON.stringify(response));
            if (response.res) {
                Alert.alert(i18n.t("visitSavedSuccessfully"), i18n.t("visitNo") + " " + response.VISIT_ID);
                navigation.goBack();
            } else {
                Alert.alert(i18n.t("error"), response.message || i18n.t("visitSaveFailed"));
            }
            setShowCloseVisitModal(false);
        } catch (error) {
            Alert.alert(i18n.t("error"), i18n.t("visitSaveFailed"));
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

    const handleAttachmentPress = (attachment) => {
        const uri = Constants.attachmentPath + "/" + attachment;
        console.log('Open attachment', uri);
        Commons.openAttachment(uri);
    };

    const previewImage = (uri) => {
        setImageUri(uri); // Set the URI of the image to be displayed
        setImagePreviewVisible(true); // Open the image preview modal
    };

    const permisionFunction = async () => {
        // here is how you can get the camera permission
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(cameraPermission.status === "granted");
        if (cameraPermission.status !== "granted") {
            alert("Permission for media access needed.");
        }
    };

    const addReqActionValidations = () => {
        if (reqDetailsNotes.trim() === "" && selectedRequestNotesRequired === "Y") {
            Alert.alert(i18n.t("error"), i18n.t("emptyNotesError"));
            return false;
        }
        if (reqDetailsAttachment.trim() === "") {
            Alert.alert(i18n.t("error"), i18n.t("missingAttachmentsError"));
            return false;
        }
        if (reqDetailsDepartment === "") {
            Alert.alert(i18n.t("error"), i18n.t("missingDepartmentError"));
            return false;
        }

        return true;
    }

    const addActionValidations = () => {
        const emptyNotes = checkedActionsList.some(action => (action.IS_CHECKED || action.EXPECTED_DATE.trim() !== "") && action.NOTES.trim() === "");
        if (emptyNotes) {
            Alert.alert(i18n.t("error"), i18n.t("emptyNotesError"));
            return false;
        }
        const missingAttachments = checkedActionsList.some(action => (action.IS_CHECKED || action.EXPECTED_DATE.trim() !== "") && !action.ATTACHMENT);
        if (missingAttachments) {
            Alert.alert(i18n.t("error"), i18n.t("missingAttachmentsError"));
            return false;
        }

        const noActionSelected = !checkedActionsList.some(action => action.IS_CHECKED || action.EXPECTED_DATE.trim() !== "");
        if (noActionSelected) {
            Alert.alert(i18n.t("error"), i18n.t("noActionSelectedError"));
            return false;
        }

        return true;
    }




    const renderImagePreviewModal = () => {
        return (
            <Modal
                visible={imagePreviewVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setImagePreviewVisible(false)}
            >
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setImagePreviewVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>{i18n.t("back")}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )
    }

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
                <Button mode="contained" icon="arrow-left" style={{ borderRadius: 0 }} onPress={async () => {
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
                <Button mode="contained" icon="arrow-left" style={{ borderRadius: 0 }} onPress={async () => {
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
                <Modal visible={showActionModal} onDismiss={() => setShowActionModal(false)} contentContainerStyle={[styles.modalStyle, { justifyContent: 'space-between', height: '100%' }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>
                            {i18n.t("actions")}
                        </Text>
                        <Text style={styles.modalTitle}>
                            {curLang == "en" && selectedDepartmentEnDesc} {curLang == "ar" && selectedDepartmentArDesc}
                        </Text>
                        <FlatList
                            keyExtractor={(item) => item.ID}
                            data={actionsList}
                            extraData={actionsList}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            renderItem={renderActionItem}
                        />
                    </View>
                    <View style={{ flexDirection: "row", paddingTop: 10 }}>
                        <Button mode="contained" icon={({ size, color }) => (
                            <Ionicons name="arrow-back" size={size} color={color} />
                        )} style={{ borderRadius: 0, flex: isReadOnly ? 1 : 0.5, marginHorizontal: 2 }} onPress={async () => {
                            setCheckedActionsList([]);
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
                            setShowActionModal(false);
                        }}>
                            <Text style={styles.text}>{i18n.t("save")}</Text>
                        </Button>)}
                    </View>

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
                        const list = checkedActionsList.map((act) => {
                            if (act.ID == item.ID) {
                                act.ATTACHMENT = attachment;
                            }
                            return act;
                        });
                        setCheckedActionsList(list);
                    }} />)}

                    {checkedActionsList.find(act => act.ID === item.ID)?.ATTACHMENT && (
                        <View style={{ flexDirection: curLang == "ar" ? "row-reverse" : "row" }}>
                            {/* <Text>
                                {i18n.t("attached")} {" : "}
                            </Text> */}
                            <TouchableOpacity onPress={() => handleAttachmentPress(checkedActionsList.find(act => act.ID === item.ID)?.ATTACHMENT)}>
                                <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>
                                    {checkedActionsList.find(act => act.ID === item.ID)?.ATTACHMENT}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}


                    <TextInput
                        key={`action-notes-${item.ID}`}
                        placeholder={i18n.t("notes")}
                        multiline={true}
                        defaultValue={checkedActionsList.find(act => act.ID === item.ID)?.NOTES || ""}
                        disabled={isReadOnly}
                        onChangeText={(text) => {
                            setCheckedActionsList(prevList =>
                                prevList.map((act) => {
                                    if (act.ID == item.ID) {
                                        return { ...act, NOTES: text };
                                    }
                                    return act;
                                })
                            );
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


                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: Platform.OS == "ios" ? 0.5 : 0, borderColor: "black", padding: 5, borderRadius: 5 }}>
                            <Text style={{ marginRight: 10 }}>{i18n.t("done")}</Text>
                            <RadioButton
                                value="done"
                                disabled={isReadOnly}
                                status={checkedActionsList.find(act => act.ID === item.ID)?.IS_CHECKED ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    const list = checkedActionsList.map((act) => {
                                        if (act.ID == item.ID) {
                                            act.IS_CHECKED = !act.IS_CHECKED;
                                            if (act.IS_CHECKED) act.EXPECTED_DATE = "";
                                        }
                                        return act;
                                    });
                                    setCheckedActionsList(list);
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
                                                const list = checkedActionsList.map((act) => {
                                                    if (act.ID == item.ID) {
                                                        act.EXPECTED_DATE = formattedDate;
                                                    }
                                                    return act;
                                                });
                                                setCheckedActionsList(list);
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
                    // if (item.LOCATION == "" || item.LOCATION == null || item.LOCATION == undefined) {
                    //     const location = await fetchCurrentPosition()
                    //     setSelectedDepartmentLocation(location);
                    //     console.log(location)
                    // }
                    let checkedActions = [];
                    actionsList.map((act) => {
                        checkedActions.push({ ID: act.ID, EN_DESC: act.EN_DESC, AR_DESC: act.AR_DESC, ATTACHMENT: "", NOTES: "", IS_CHECKED: false, EXPECTED_DATE: "", DEPARTMENT: item.ID });
                    })
                    setCheckedActionsList(checkedActions);
                    setShowActionModal(true);
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
                    setReqDetailsDepartment(item.ID);
                    setReqDetailsDepartmentName(curLang == "en" ? item.EN_DESC : item.AR_DESC);
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
                    setShowActionModal(true);
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




    useEffect(() => {
        permisionFunction();
        requestCallLogPermission();
    }, []);

    useEffect(() => {
        (async () => {
            if (selectedType == "Visit") {
                if (startLocation == "" || startLocation == undefined || startLocation == null) {
                    const loc = await getCurrentLocationWithLoading();
                    if (loc) {
                        setStartLocation(loc);
                        console.log(loc);
                    }
                }
            }
            // Only set visitStartTime to current time if it wasn't loaded from visit details
            if (visitStartTime == "" || visitStartTime == undefined || visitStartTime == null) {
                const result = await ServerOperations.getServerTime();
                setVisitStartTime(result.res);
            }
        })();
    }, [selectedType]);

    // Add these useEffect hooks to prevent multiple dropdowns from being open:
    useEffect(() => {
        if (businessTypeOpen) {
            setVisitCallOpen(false);
            setVisitTypeOpen(false);
        }
    }, [businessTypeOpen]);

    useEffect(() => {
        if (visitCallOpen) {
            setBusinessTypeOpen(false);
            setVisitTypeOpen(false);
        }
    }, [visitCallOpen]);

    useEffect(() => {
        if (visitTypeOpen) {
            setBusinessTypeOpen(false);
            setVisitCallOpen(false);
        }
    }, [visitTypeOpen]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            // Ordered phases for potential customer visit creation / edit
            const phases = [
                'loadingGettingUser',
                'loadingCustomerDetails',
                'loadingVisits',
                'loadingDepartments',
                'loadingActions',
                'loadingLocationCheck'
            ];
            setTotalSteps(phases.length);
            setCurrentStep(0);

            // 1. Get user / lang / basic params
            setPhaseMessage(phases, 'loadingGettingUser');
            const curLang = await Commons.getFromAS("lang");
            const curUser = await Commons.getFromAS("userID");
            const type = await Commons.getFromAS("type");
            setEmpType(type);
            setCurUser(curUser);
            setCurLang(curLang);
            setSelectedCust(route.params.custID);
            setSelectedCustName(route.params.custName);
            setSelectedCustPhone(route.params.phone);
            setCustomerType(route.params.customerType);
            setPendingVisitId(route.params.pendingVisitId);

            // 2. Business types + transform (considered part of customer details enrichment)
            setPhaseMessage(phases, 'loadingCustomerDetails');
            const res2 = await ServerOperations.getBusinessTypes();
            if (res2) {
                setBusinessTypesList(res2);
                const businessTypeDropdownItems = res2.map(businessType => ({
                    label: curLang === "en" ? businessType.EN_DESC : businessType.AR_DESC,
                    value: businessType.ID
                }));
                setBusinessTypeItems(businessTypeDropdownItems);
            }

            // 3. Previous visits (Potential)
            setPhaseMessage(phases, 'loadingVisits');
            const visits = await ServerOperations.getCustomerVisits(route.params.custID, "Potential");
            if (visits) {
                setCustomerVisits(visits);
                setFilteredCustomerVisits(visits);
            }

            // 4. Departments
            setPhaseMessage(phases, 'loadingDepartments');
            const deps = await ServerOperations.getDepartments();
            if (deps) {
                setDepartmentsList(deps);
                setFilteredDepartmentsList(deps);
            }

            // 5. Actions for potential
            setPhaseMessage(phases, 'loadingActions');
            const acts = await ServerOperations.getActions(type, 'Potential');
            if (acts) {
                setActionsList(acts);
            }

            // Existing visit details if editing
            if (route.params.visitID) {
                const visitIdParam = route.params.visitID;
                if (visitIdParam !== "") {
                    setVisitID(visitIdParam);
                    const res = await ServerOperations.getVisitDetails(visitIdParam);
                    const currentDate = moment().format('DD/MM/YYYY');
                    const canEditRes = await ServerOperations.canEditVisit(visitIdParam, curUser, currentDate);
                    if (res) {
                        setAddedDepartmentsList(res.DEPARTMENTS);
                        setSelectedVisitType(res.TYPE);
                        setCallDuration(res.CALL_DURATION);
                        if (res.CALL_DURATION && res.CALL_DURATION !== "null") {
                            setCallEnded(true);
                        } else {
                            setCallEnded(false);
                        }
                        setSelectedType(res.VISIT_CALL);
                        // setStartLocation(res.START_LOCATION);
                        setStartTime(res.START_TIME);
                        if (res.START_TIME) setVisitStartTime(res.START_TIME);
                        if (canEditRes.res) { setIsReadOnly(false); setIgnoreLoc(true); } else { setIsReadOnly(true); }
                        if (res.VISIT_CALL === "Visit") await checkLocationDistance(route.params.custID);
                    }
                }
            }

            if (route.params.visitID === "") {
                setVisitID("NEW");
                setIsReadOnly(false);
            }

            // 6. Location check (only if Visit)
            setPhaseMessage(phases, 'loadingLocationCheck');
            if (selectedType === "Visit") {
                if (!startLocation) {
                    for (let i = 0; i < 2; i++) {
                        const loc = await getCurrentLocationWithLoading();
                        if (loc) { setStartLocation(loc); break; }
                        await delay(1200);
                    }
                }
                await checkLocationDistance(route.params.custID);
            }

            setLoading(false);
            setLoadingMessage("");
        })();
    }, [selectedType]);

    const checkLocationDistance = async (custID) => {
        const details = await ServerOperations.getPotentialCustomerDetails(custID);
        if (details != null && details != "" && details != undefined && !isReadOnly) {
            setContactsList(details.CONTACTS);
            setSelectedCustBusinessType(details.BUSINESS_TYPE);
            const customerLoc = details.LOCATION;
            const curLoc = await getCurrentLocation();
            console.log(customerLoc, curLoc);
            if (curLoc && customerLoc && !ignoreLoc) {
                const [curLat, curLon] = curLoc.split(',').map(Number);
                const [custLat, custLon] = customerLoc.split(',').map(Number);
                const distance = Commons.calculateDistance(curLat, curLon, custLat, custLon);
                console.log('Distance:', distance);
                if (distance > 0.75) {
                    const distanceInMeters = Math.round(distance * 1000);
                    Alert.alert(i18n.t("error"), i18n.t("mustBeInLocation") + ` تبعد (${distanceInMeters}متر)`);
                    navigation.goBack();
                }
            }
        }
    }

    // Delay helper between attempts
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


    async function getCurrentLocation(retries = 5) {
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
                setLoading(false)
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

            //  More specific error messages
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
        setLoadingMessage(i18n.t("loading"));

        try {
            const result = await getCurrentLocation();
            return result;
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };


    const renderContactsModal = () => {
        return (
            <CustomerContacts
                contactsList={contactsList}
                setContactsList={setContactsList}
                customer={selectedCust}
                customerType="Potential"
                visible={showContactsModal}
                onDismiss={() => setShowContactsModal(false)}
                curLang={curLang}
            />
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
                                            navigation.push("NewCustomerVisit", { custID: selectedCust, custName: selectedCustName, phone: selectedCustPhone, visitID: item.VISIT_ID });
                                        }
                                    }
                                ]
                            );
                        }} style={{ padding: 15, borderWidth: 0.5, borderRadius: 5, marginBottom: 5 }}>
                            <Text style={{ color: "red", alignSelf: 'center' }}>{item.VISIT_ID}</Text>
                            <Text>{i18n.t("date")}: {item.DATE}</Text>
                            <Text>{i18n.t("time")}: {item.TIME}</Text>
                            <Text>{i18n.t("username")}: {item.USER}</Text>
                            <Text>{i18n.t("type")}: {item.TYPE}</Text>
                            <Text style={styles.rowText}>{i18n.t("visitcall")}: {item.VISIT_CALL}</Text>
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

    const renderAddReqActionModal = () => {
        return (
            <Modal visible={showReqActionModal} onDismiss={() => setShowReqActionModal(false)} contentContainerStyle={styles.modalStyle}>
                <Text style={styles.modalTitle}>
                    {i18n.t("requestAction")}
                </Text>
                <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => setShowReqActionModal(false)}>
                    <Text style={styles.text}>{i18n.t("back")}</Text>
                </Button>
            </Modal>
        );
    };

    const renderReqDetailsModal = () => {
        return (
            <Modal visible={showReqDetailsModal} onDismiss={() => setShowReqDetailsModal(false)} contentContainerStyle={styles.modalStyle}>
                <Text style={styles.modalTitle}>
                    {i18n.t("requestDetails")}
                </Text>
                <Button mode="contained" style={{ borderRadius: 0 }} onPress={() => setShowReqDetailsModal(false)}>
                    <Text style={styles.text}>{i18n.t("back")}</Text>
                </Button>
            </Modal>
        );
    };

    const renderCloseVisitModal = () => {
        return (
            <Modal visible={showCloseVisitModal} onDismiss={() => {
                setShowCloseVisitModal(false);
                setShowEditCustomerButton(false);
            }} contentContainerStyle={styles.modalStyle}>
                <Text style={styles.modalTitle}>
                    {i18n.t("closeVisit")}
                </Text>

                <RadioButton.Group
                    onValueChange={newValue => setCustomerStatus(newValue)}
                    value={customerStatus}
                >
                    <TouchableOpacity
                        style={styles.radioButtonContainer}
                        onPress={() => setCustomerStatus("Pending")}
                    >
                        <RadioButton value="keepAsPending" />
                        <Text style={styles.radioButtonText}>{i18n.t("keepAsPending")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioButtonContainer}
                        onPress={() => setCustomerStatus("discardCustomer")}
                    >
                        <RadioButton value="discardCustomer" />
                        <Text style={styles.radioButtonText}>{i18n.t("discardCustomer")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioButtonContainer}
                        onPress={() => setCustomerStatus("Pending creation")}
                    >
                        <RadioButton value="Pending creation" />
                        <Text style={styles.radioButtonText}>{i18n.t("requestERPCreation")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.radioButtonContainer, { marginBottom: 20 }]}
                        onPress={() => setCustomerStatus("Price Offer")}
                    >
                        <RadioButton value="priceOffer" />
                        <Text style={styles.radioButtonText}>{i18n.t("priceOffer")}</Text>
                    </TouchableOpacity>
                </RadioButton.Group>

                {showEditCustomerButton && (
                    <View style={{ marginBottom: 20 }}>
                        <Button
                            mode="contained"
                            icon="account-edit"
                            style={{
                                borderRadius: 0,
                                backgroundColor: "#1e3a8a",
                                marginVertical: 10
                            }}
                            onPress={() => {
                                setShowCloseVisitModal(false);
                                navigation.navigate("NewCustomerPotential", {
                                    custID: selectedCust,
                                    custName: selectedCustName,
                                    phone: selectedCustPhone,
                                    isEdit: true
                                });
                            }}
                        >
                            <Text style={styles.text}>{i18n.t("editCustomerDetails")}</Text>
                        </Button>
                    </View>
                )}

                <View style={{ flexDirection: "row" }}>
                    <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => {
                        setShowCloseVisitModal(false);
                        setShowEditCustomerButton(false);
                    }}>
                        <Text style={styles.text}>{i18n.t("cancel")}</Text>
                    </Button>
                    <Button mode="contained" style={{ borderRadius: 0, flex: 0.5, marginHorizontal: 2 }} onPress={() => {
                        saveVisit();
                    }}>
                        <Text style={styles.text}>{i18n.t("saveVisit")}</Text>
                    </Button>
                </View>
            </Modal>
        );
    };

    return (
        [<Portal>{showAddDepartmentDialog && renderAddDepartmentDialog()}</Portal>,
        <Portal>{showReqActionModal && renderAddReqActionModal()}</Portal>,
        <Portal>{showReqDetailsModal && renderReqDetailsModal()}</Portal>,
        <Portal>{showAddReqDepartmentDialog && renderAddReqDepartmentDialog()}</Portal>,
        <Portal>{showActionModal && renderAddActionModal()}</Portal>,
        <Portal>{imagePreviewVisible && renderImagePreviewModal()}</Portal>,
        <Portal>{showCloseVisitModal && renderCloseVisitModal()}</Portal>,
        <Portal>{showCustomerVisitsModal && renderCustomerVisitsModal()}</Portal>,
        <Portal>{showContactsModal && renderContactsModal()}</Portal>,
        <Portal>{loading && <ProgressDialog visible={loading} message={loadingMessage} />}</Portal>,
        <SafeAreaView style={styles.cardContainer}>
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

                {/* <Text style={[styles.text, { marginTop: 10, textAlign: curLang == "ar" ? "right" : "left" }]}>{i18n.t("phone")} {" : "} {selectedCustPhone}  </Text> */}
                <Button icon="contacts" style={{ marginHorizontal: 2, alignSelf: "center" }} labelStyle={{ color: "white" }} onPress={() => setShowContactsModal(true)}>
                    <Text style={{ fontSize: 12 }}>{i18n.t("contacts")}</Text>
                </Button>


            </View>
            <View style={styles.taskItemView(curLang)}>
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
                            backgroundColor: isReadOnly ? "#f5f5f5" : "white"
                        }]}
                        textStyle={{ color: selectedType === "" ? "gray" : "black" }}
                        dropDownContainerStyle={styles.dropdownContainer}
                        onChangeValue={async (itemValue) => {
                            if (addedDepartmentsList.length > 0) {
                                //Alert.alert(i18n.t("error"), i18n.t("cantChangeTypeIfDepartmentsAdded"));
                                setSelectedType(selectedType);
                                return;
                            }
                            if (itemValue == "Call") {
                                openDialer(selectedCustPhone);
                            } else {
                                setCallDuration("");
                                setCallEnded(false);
                            }
                        }}
                        zIndex={2000}
                        zIndexInverse={2000}
                    />
                </View>
            </View>
            {selectedType == "Call" && (<View style={{ alignSelf: "center" }}>
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
                        zIndex={1000}
                        zIndexInverse={3000}
                    />
                </View>
            </View>

            <TouchableOpacity style={{ flexDirection: curLang == "ar" ? 'row' : 'row-reverse', justifyContent: "space-between", backgroundColor: Constants.appColor, padding: 10, width: "100%" }} onPress={() => {
                if (!isReadOnly) {
                    if (selectedType == "") {
                        Alert.alert(i18n.t("error"), i18n.t("selectVisitCall"));
                        return;
                    }
                    setShowAddDepartmentDialog(true);
                }
            }}>
                <Ionicons name="add-circle-outline" size={26} color="white" />
                <Text style={{ textAlign: "flex-end", fontSize: 16, color: "white", fontWeight: "bold" }}>
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
            {!isReadOnly && !showActionModal && (
                <Button
                    mode="contained"
                    icon="content-save"
                    disabled={loading}
                    onPress={() => setShowCloseVisitModal(true)}
                >
                    <Text style={styles.text}>{loading ? i18n.t("saving") : i18n.t("saveVisit")}</Text>
                </Button>
            )}
            {isReadOnly && (
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
};
const styles = StyleSheet.create({
    saveButton: { position: 'absolute', bottom: 0, width: width - 20, marginVertical: 15, alignSelf: "center" },
    dropdownStyle: {
        width: width / 1.7,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    },
    dropdownContainer: {
        width: width / 1.7,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    },
    viewContainer: {
        width: "80%",
        marginTop: 80,
    },
    addButtonStyle: { color: "white" },
    text: { color: "white", fontWeight: "bold", fontSize: 16 },
    radioButtonText: {
        color: "#333333",
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 12,
        flex: 1,
        textAlign: "left",
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: "#f8f9fa",
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    taskItemView: curLang => ({
        flexDirection: curLang == "ar" ? "row-reverse" : "row",
        marginHorizontal: 10,
        marginVertical: 5,
    }),
    text2: curLang => ({
        fontWeight: "bold",
        fontSize: 16,
        alignSelf: "center",
        minWidth: width / 3.3,  // Add fixed minimum width for text
        textAlign: curLang == "ar" ? "right" : "left"
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
        maxHeight: height / 2,
    },
    modalTitle: { textAlign: "center", fontSize: 16, backgroundColor: Constants.appColor, color: "white", fontWeight: "bold", padding: 10, width: "100%" }
});
