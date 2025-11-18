import React, { useState, useEffect } from 'react';
import { Button, TextInput, Portal, Modal } from 'react-native-paper';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AttachmentPicker from '../components/AttachmentPicker';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressDialog from '../components/ProgressDialog';
import * as Commons from "../utils/Commons";
import * as Constants from "../utils/Constants";
import * as ServerOperations from "../utils/ServerOperations";
import { height, width } from "../utils/Styles";
import MapView, { Marker } from 'react-native-maps';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


export const NewCustomerPotentialScreen = ({ route, navigation }) => {
    const [customerName, setCustomerName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPersonPhone, setContactPersonPhone] = useState('');
    const [contactPersonPosition, setContactPersonPosition] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [numOfBranches, setNumOfBranches] = useState('');
    const [employeeCount, setEmployeeCount] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [curLang, setCurLang] = useState("");
    const [curUser, setCurUser] = useState("");
    const [empType, setEmpType] = useState("");
    const [sourcesList, setSourcesList] = useState([]);
    const [selectedSource, setSelectedSource] = useState("");
    const [businessTypesList, setBusinessTypesList] = useState([]);
    const [selectedBusinessType, setSelectedBusinessType] = useState("");
    const [progressDialogVisible, setProggressDialogVisible] = useState(false);
    const [customerValue, setCustomerValue] = useState("E");
    const [customValue, setCustomValue] = useState("");
    const [showCustomValueInput, setShowCustomValueInput] = useState(false);
    const [mapVisible, setMapVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [searchLocation, setSearchLocation] = useState('');
    const [custID, setCustID] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [paymentTerm, setPaymentTerm] = useState('');
    const [sourceOpen, setSourceOpen] = useState(false);
    const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
    const [paymentTermOpen, setPaymentTermOpen] = useState(false);
    const [customerValueOpen, setCustomerValueOpen] = useState(false);

    // Add dropdown items
    const [sourceItems, setSourceItems] = useState([]);
    const [businessTypeItems, setBusinessTypeItems] = useState([]);
    const [paymentTermItems, setPaymentTermItems] = useState([
        { label: "Cash", value: "Cash" },
        { label: "Credit 30", value: "Credit 30" },
        { label: "Credit 45", value: "Credit 45" },
        { label: "Credit 60", value: "Credit 60" },
        { label: "Credit 90", value: "Credit 90" },
        { label: "Credit 120", value: "Credit 120" }
    ]);
    const [customerValueItems, setCustomerValueItems] = useState([
        { label: "0 - 150", value: "E" },
        { label: "150 - 500", value: "D" },
        { label: "501 - 1000", value: "C" },
        { label: "1001 - 2000", value: "B" },
        { label: "2001 And More", value: "A" }
    ]);

    const handleSearchLocation = async () => {
        try {
            const geocode = await Location.geocodeAsync(searchLocation);
            if (geocode.length > 0) {
                const { latitude, longitude } = geocode[0];
                setSelectedLocation({ latitude, longitude });
                setCustomerAddress(`${latitude}, ${longitude}`);
            } else {
                Alert.alert(i18n.t('error'), i18n.t('locationNotFound'));
            }
        } catch (error) {
            Alert.alert(i18n.t('error'), i18n.t('locationNotFound'));
        }
    };

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
        setCustomerAddress(`${latitude}, ${longitude}`);
        setMapVisible(false);
    };

    const handleAttachmentPress = (attachment) => {
        const uri = Constants.attachmentPath + "/" + attachment;
        console.log('Open attachment', uri);
        Commons.openAttachment(uri);
    };

    // Add these useEffect hooks to prevent multiple dropdowns from being open:
    useEffect(() => {
        if (sourceOpen) {
            setBusinessTypeOpen(false);
            setPaymentTermOpen(false);
            setCustomerValueOpen(false);
        }
    }, [sourceOpen]);

    useEffect(() => {
        if (businessTypeOpen) {
            setSourceOpen(false);
            setPaymentTermOpen(false);
            setCustomerValueOpen(false);
        }
    }, [businessTypeOpen]);

    useEffect(() => {
        if (paymentTermOpen) {
            setSourceOpen(false);
            setBusinessTypeOpen(false);
            setCustomerValueOpen(false);
        }
    }, [paymentTermOpen]);

    useEffect(() => {
        if (customerValueOpen) {
            setSourceOpen(false);
            setBusinessTypeOpen(false);
            setPaymentTermOpen(false);
        }
    }, [customerValueOpen]);

    useEffect(() => {
        (async () => {
            setProggressDialogVisible(true);
            const curLang = await Commons.getFromAS("lang");
            const curUser = await Commons.getFromAS("userID");
            const type = await Commons.getFromAS("type");
            setEmpType(type);
            setCurUser(curUser);
            setCurLang(curLang);
            const res = await ServerOperations.getSources();
            if (res) {
                setSourcesList(res);
                const sourceDropdownItems = res.map(source => ({
                    label: curLang === "en" ? source.EN_DESC : source.AR_DESC,
                    value: source.ID
                }));
                setSourceItems(sourceDropdownItems);
            }
            const res2 = await ServerOperations.getBusinessTypes();
            if (res2) {
                setBusinessTypesList(res2);
                const businessTypeDropdownItems = res2.map(btype => ({
                    label: curLang === "en" ? btype.EN_DESC : btype.AR_DESC,
                    value: btype.ID
                }));
                setBusinessTypeItems(businessTypeDropdownItems);
            }
            if (route.params.custID != null && route.params.custID != "" && route.params.custID != undefined) {
                setCustID(route.params.custID);
                const resp = await ServerOperations.getPotentialCustomerDetails(route.params.custID);
                if (resp) {
                    setCustomerName(resp.CUST_NAME);
                    setContactPerson(resp.CONTACTS[0].NAME);
                    setContactPersonPhone(resp.CONTACTS[0].PHONE);
                    setContactPersonPosition(resp.CONTACTS[0].POSITION);
                    setCustomerAddress(resp.ADDRESS);
                    setSelectedSource(resp.SOURCE);
                    setSelectedBusinessType(resp.BUSINESS_TYPE);
                    setPhone(resp.PHONE);
                    setEmail(resp.EMAIL);
                    setNumOfBranches(resp.NUM_OF_BRANCHES);
                    setEmployeeCount(resp.EMPLOYEE_CNT);
                    setCustomerValue(resp.CUSTOMER_VALUE);
                    setCustomValue(resp.CUSTOM_VALUE);
                    setPaymentTerm(resp.PAYMENT_TERM)
                    resp.CUSTOMER_VALUE == 'A' ? setShowCustomValueInput(true) : setShowCustomValueInput(false);
                    setAttachments(resp.ATTACHMENTS.split("@@"));
                }
            } else {
                setSelectedSource(res[0].ID);
                setSelectedBusinessType(res2[0].ID);
            }
            setProggressDialogVisible(false);
        })();
    }, []);

    // Helper function with timeout and retry logic
    const getCurrentLocationHelper = (timeout = 10000, enableHighAccuracy = true) => {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Location request timed out'));
            }, timeout);

            Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low,
                timeout: timeout,
                maximumAge: 1000,
            }).then((position) => {
                clearTimeout(timeoutId);
                resolve(position);
            }).catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    };

    const getCurrentLocation = async () => {
        setProggressDialogVisible(true);
        setLoadingMessage(i18n.t('fetchingLocation'));

        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(i18n.t('error'), i18n.t('locationPermissionDenied'));
                setProggressDialogVisible(false);
                return null;
            }

            let position;
            try {
                // First attempt with high accuracy and 10 second timeout
                position = await getCurrentLocationHelper(10000, true);
            } catch (error) {
                console.log('High accuracy location failed, retrying with low accuracy:', error.message);
                try {
                    // Retry with low accuracy and 15 second timeout
                    position = await getCurrentLocationHelper(15000, false);
                } catch (retryError) {
                    console.log('Low accuracy location also failed:', retryError.message);
                    Alert.alert(i18n.t('error'), i18n.t('locationUnavailable'));
                    setProggressDialogVisible(false);
                    return null;
                }
            }

            if (position && position.coords) {
                setCurrentPosition({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setSelectedLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                console.log('Current position:', position.coords.latitude, position.coords.longitude);
            } else {
                Alert.alert(i18n.t('error'), i18n.t('locationUnavailable'));
            }
        } catch (error) {
            console.log('Location fetch error:', error);
            Alert.alert(i18n.t('error'), i18n.t('locationUnavailable'));
        } finally {
            setProggressDialogVisible(false);
        }
    };

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({});
        if (result.type === 'success') {
            setAttachments([...attachments, result]);
        }
    };

    const handleCustomerValueChange = (value) => {
        setCustomerValue(value);
        if (value === 'A') {
            setShowCustomValueInput(true);
        } else {
            setShowCustomValueInput(false);
            setCustomValue('');
        }
    };



    const renderMapModal = () => {
        return (
            <Modal visible={mapVisible} onDismiss={() => setMapVisible(false)} contentContainerStyle={styles.modalContainer}>
                <View style={styles.mapContainer}>
                    <TextInput
                        value={searchLocation}
                        onChangeText={setSearchLocation}
                        onSubmitEditing={(loc) => { handleSearchLocation(loc); setSearchLocation('') }}
                        placeholder={i18n.t('search')}
                    />
                    <Button
                        mode="contained"
                        icon="crosshairs-gps"
                        style={{ marginVertical: 5 }}
                        onPress={async () => {
                            await getCurrentLocation();
                        }}
                    >
                        {i18n.t('currentLocation')}
                    </Button>
                    <MapView
                        onPress={(event) => {
                            const { latitude, longitude } = event.nativeEvent.coordinate;
                            setSelectedLocation({ latitude, longitude });
                        }}
                        style={styles.map}
                        region={selectedLocation ? {
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        } : {
                            latitude: currentPosition ? currentPosition.latitude : 31.9150,
                            longitude: currentPosition ? currentPosition.longitude : 35.9643,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        {selectedLocation && (
                            <Marker coordinate={selectedLocation} draggable />
                        )}
                        {currentPosition && !selectedLocation && (
                            <Marker coordinate={currentPosition} draggable />
                        )}
                    </MapView>
                    <View style={styles.modalButtons}>
                        <Button mode="contained" style={{ flex: 0.5, marginHorizontal: 2 }} onPress={() => setMapVisible(false)}>{i18n.t('back')}</Button>
                        <Button mode="contained" style={{ flex: 0.5, marginHorizontal: 2 }} onPress={() => {
                            if (!selectedLocation) {
                                Alert.alert(i18n.t('error'), i18n.t('selectLocation'));
                                return;
                            }
                            setCustomerAddress(`${selectedLocation.latitude}, ${selectedLocation.longitude}`);
                            setMapVisible(false)
                        }}>{i18n.t('confirm')}</Button>
                    </View>
                </View>
            </Modal>
        );
    };


    const validateForm = () => {
        if (!customerName) {
            Alert.alert(i18n.t('error'), i18n.t('customerName') + ' ' + i18n.t('isRequired'));
            return false;
        }
        if (!contactPerson) {
            Alert.alert(i18n.t('error'), i18n.t('contactPerson') + ' ' + i18n.t('isRequired'));
            return false;
        }
        if (!contactPersonPhone) {
            Alert.alert(i18n.t('error'), i18n.t('contactPersonPhone') + ' ' + i18n.t('isRequired'));
            return false;
        }
        if (!numOfBranches) {
            Alert.alert(i18n.t('error'), i18n.t('numOfBranches') + ' ' + i18n.t('isRequired'));
            return false;
        }
        if (!selectedSource) {
            Alert.alert(i18n.t('error'), i18n.t('source') + ' ' + i18n.t('isRequired'));
            return false;
        }
        if (!customerValue) {
            Alert.alert(i18n.t('error'), i18n.t('customValue') + ' ' + i18n.t('isRequired'));
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        // Handle form submission
        if (!validateForm()) {
            return;
        }
        setProggressDialogVisible(true);
        let atts = '';
        attachments.map((att) => {
            atts = atts + att + '@@'
        })
        atts = atts.slice(0, -2);
        const resp = await ServerOperations.savePotentialCustomer(customerName, contactPerson, contactPersonPhone, contactPersonPosition, customerAddress, selectedSource, selectedBusinessType, phone, email, numOfBranches, employeeCount, customerValue, customValue, curUser, atts, custID, paymentTerm);
        if (resp.RES) {
            Alert.alert(i18n.t('success'), i18n.t('customerSavedSuccessfully'));
            //navigation.goBack();
        }
        setProggressDialogVisible(false);
    };

    return (
        [<Portal>{mapVisible && renderMapModal()}</Portal>,
        <SafeAreaView style={styles.container}>
            <ProgressDialog visible={progressDialogVisible} message={loadingMessage} />

            {/* Create a single FlatList that contains all your content */}
            <FlatList
                data={[{ key: 'content' }]} // Single item array
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={true}
                renderItem={() => (
                    <View style={{ padding: 15 }}>
                        <Text style={styles.label}>{i18n.t('customerName')} *</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={customerName}
                            onChangeText={setCustomerName}
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('contactPerson')} *</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={contactPerson}
                            onChangeText={setContactPerson}
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('contactPersonPhone')} *</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={contactPersonPhone}
                            onChangeText={setContactPersonPhone}
                            keyboardType="phone-pad"
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('contactPersonPosition')} *</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={contactPersonPosition}
                            onChangeText={setContactPersonPosition}
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('customerAddress')} *</Text>
                        <View style={{ flexDirection: "row", width: '100%' }}>
                            <TextInput
                                style={[styles.input(curLang), { fontSize: 12, width: '89%' }]}
                                value={customerAddress}
                                disabled={true}
                                onChangeText={setCustomerAddress}
                                underlineColor="transparent"
                            />
                            <Ionicons name="location" style={{ marginTop: 10, marginLeft: 10 }} size={26} color={Constants.darkBlueColor} onPress={() => { setMapVisible(true); setSearchLocation('') }} />
                        </View>

                        <Text style={styles.label}>{i18n.t('source')} *</Text>
                        <View>
                            <DropDownPicker
                                open={sourceOpen}
                                value={selectedSource}
                                items={sourceItems}
                                setOpen={setSourceOpen}
                                setValue={setSelectedSource}
                                setItems={setSourceItems}
                                placeholder={i18n.t('source')}
                                style={styles.dropdownStyle}
                                dropDownContainerStyle={styles.dropdownContainer}
                                zIndex={4000}
                                zIndexInverse={1000}
                            />
                        </View>
                        <Text style={styles.label}>{i18n.t('businessType')}</Text>
                        <View>
                            <DropDownPicker
                                open={businessTypeOpen}
                                value={selectedBusinessType}
                                items={businessTypeItems}
                                setOpen={setBusinessTypeOpen}
                                setValue={setSelectedBusinessType}
                                setItems={setBusinessTypeItems}
                                placeholder={i18n.t('businessType')}
                                listMode="SCROLLVIEW"
                                scrollViewProps={{
                                    nestedScrollEnabled: true,
                                }}
                                style={styles.dropdownStyle}
                                dropDownContainerStyle={[styles.dropdownContainer, {
                                    position: 'relative',
                                    top: -20
                                }]}
                                searchable={true}
                                zIndex={3000}
                                zIndexInverse={2000}
                            />
                        </View>
                        <Text style={styles.label}>{i18n.t('paymentTerm')}</Text>
                        <View>
                            <DropDownPicker
                                open={paymentTermOpen}
                                value={paymentTerm}
                                items={paymentTermItems}
                                setOpen={setPaymentTermOpen}
                                setValue={setPaymentTerm}
                                setItems={setPaymentTermItems}
                                placeholder={i18n.t('paymentTerm')}
                                style={styles.dropdownStyle}
                                dropDownContainerStyle={styles.dropdownContainer}
                                zIndex={2000}
                                zIndexInverse={3000}
                            />
                        </View>
                        <Text style={styles.label}>{i18n.t('phone')}</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('email')}</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('numOfBranches')} *</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={numOfBranches}
                            onChangeText={setNumOfBranches}
                            keyboardType="numeric"
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('employeeCount')}</Text>
                        <TextInput
                            style={styles.input(curLang)}
                            value={employeeCount}
                            onChangeText={setEmployeeCount}
                            keyboardType="numeric"
                            underlineColor="transparent"
                        />

                        <Text style={styles.label}>{i18n.t('customerValue')} *</Text>
                        <View style={styles.row(curLang)}>
                            {showCustomValueInput && (
                                <TextInput
                                    style={styles.customInput(curLang)}
                                    value={customValue}
                                    onChangeText={setCustomValue}
                                    keyboardType="numeric"
                                    placeholder={i18n.t("customValue")}
                                    underlineColor="transparent"
                                />
                            )}
                            <View style={{ flex: showCustomValueInput ? 0.65 : 1 }}>
                                <DropDownPicker
                                    open={customerValueOpen}
                                    value={customerValue}
                                    items={customerValueItems}
                                    setOpen={setCustomerValueOpen}
                                    setValue={setCustomerValue}
                                    setItems={setCustomerValueItems}
                                    placeholder={i18n.t('customerValue')}
                                    style={styles.dropdownStyle}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    onChangeValue={handleCustomerValueChange}
                                    zIndex={1000}
                                    zIndexInverse={4000}
                                />
                            </View>
                        </View>

                        <AttachmentPicker onAttachmentSelected={(attachment) => { setAttachments([...attachments, attachment]); console.log(attachment) }} />

                        {attachments.length > 0 && (
                            <View style={{ flexWrap: 'wrap' }}>
                                {attachments.map((attachment, index) => (
                                    <View key={index}>
                                        <TouchableOpacity style={{ paddingVertical: 10 }} onPress={() => handleAttachmentPress(attachment)}>
                                            <Text style={{ textDecorationLine: 'underline', color: 'blue', marginRight: 5 }}>
                                                {attachment}
                                            </Text>
                                        </TouchableOpacity>
                                        <View
                                            style={{
                                                borderBottomColor: 'gray',
                                                borderBottomWidth: StyleSheet.hairlineWidth,
                                            }}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}

                        <Button mode="contained" onPress={handleSubmit} style={styles.button}>{i18n.t('save')}</Button>
                    </View>
                )}
            />
        </SafeAreaView>]
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    input: curLang => ({
        marginBottom: 25,
        backgroundColor: '#fff',
        textAlign: curLang == "ar" ? "right" : "left",
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        fontSize: 14,
        height: 50
    }),
    row: (curLang) => ({
        flexDirection: curLang == "ar" ? 'row' : 'row-reverse',
        alignItems: 'center',
        marginBottom: 25,
    }),
    dropdownStyle: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',
        marginBottom: 25,
    },
    dropdownContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',

    },

    customInput: curLang => ({
        flex: 0.35,
        backgroundColor: '#fff',
        marginRight: curLang == "ar" ? 5 : 0,
        marginLeft: curLang == "en" ? 5 : 0,
        textAlign: curLang == "ar" ? "right" : "left",
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        fontSize: 12,
        height: 48,
        marginBottom: 25,
    }),
    button: {
        marginTop: 15,
        padding: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        width: '90%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '70%',
    },
    modalButtons: {
        flexDirection: 'row',
        paddingTop: 20
    },
});
