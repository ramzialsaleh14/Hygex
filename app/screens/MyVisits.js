import React, { useState, useEffect } from "react";
import { TextInput } from "react-native-paper";
import * as ServerOperations from "../utils/ServerOperations";
import * as Commons from "../utils/Commons";
import * as Constants from "../utils/Constants";
import Color from 'react-native-material-color';
import {
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    Text,
    FlatList,
    Alert,
} from "react-native";
import i18n from "../languages/langStrings";
import ProgressDialog from '../components/ProgressDialog';
import { height, width } from "../utils/Styles";
import { useFocusEffect } from '@react-navigation/native';


TouchableOpacity.defaultProps = { activeOpacity: 0.8 };

const AppButton = ({ onPress, title }) => (
    <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);

export const MyVisitsScreen = ({ route, navigation }) => {
    //**Variables**//
    const [proggressDialogVisible, setProggressDialogVisible] = useState(false);
    const [visits, setVisits] = useState([{
        "VISIT_ID": "",
        "CUSTOMER": "",
        "CUST_TYPE": "",
        "DATE": "",
        "START_TIME": "",
        "END_TIME": "",
        "USER": "",
        "TYPE": ""
    }]);
    const [filteredVisits, setFilteredVisits] = useState([]);
    const [curLang, setCurLang] = useState("e");

    const loadVisits = async () => {
        setProggressDialogVisible(true);
        try {
            const curLang = await Commons.getFromAS("lang");
            setCurLang(curLang);
            const curUser = await Commons.getFromAS("userID");
            const visits = await ServerOperations.getVisits(route.params.custID, route.params.fromDate, route.params.toDate, curUser, route.params.customerType, route.params.type);
            if (visits != null && visits != "" && visits != undefined) {
                setVisits(visits);
                setFilteredVisits(visits);
            }
        } catch (error) {
            console.error('Error loading visits:', error);
        } finally {
            setProggressDialogVisible(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadVisits();
        }, [route.params.custID, route.params.fromDate, route.params.toDate, route.params.customerType, route.params.type])
    );
    return (
        [
            <SafeAreaView style={styles.cardContainer}>
                <ProgressDialog visible={proggressDialogVisible} />
                <TextInput
                    style={styles.searchBox}
                    placeholder={i18n.t("search")}
                    onChangeText={(text) => {
                        const filteredList = Commons.handleSearch(text, visits);
                        setFilteredVisits(filteredList);
                    }}
                />
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadVisits}
                    disabled={proggressDialogVisible}
                >
                    <Text style={styles.refreshButtonText}>{i18n.t("refresh")}</Text>
                </TouchableOpacity>
                <FlatList
                    keyExtractor={(item) => item.VISIT_ID}
                    data={filteredVisits}
                    extraData={filteredVisits}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={{ padding: 15, borderBottomWidth: 1, borderColor: "grey", marginBottom: 5 }}
                            onPress={() => {
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
                                            onPress: () => {
                                                if (item.CUST_TYPE == "Existing") {
                                                    navigation.navigate("NewVisit", {
                                                        custID: item.CUSTOMER,
                                                        custName: item.CUSTOMER_NAME,
                                                        phone: item.CUST_PHONE,
                                                        visitID: item.VISIT_ID,
                                                    });
                                                } else {
                                                    navigation.navigate("NewCustomerVisit", {
                                                        custID: item.CUSTOMER,
                                                        custName: item.CUSTOMER_NAME,
                                                        phone: item.CUST_PHONE,
                                                        visitID: item.VISIT_ID,
                                                    });
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Text style={{ color: "red", alignSelf: 'center', fontWeight: "bold" }}>{item.VISIT_ID}</Text>
                            <Text style={{ alignSelf: 'center', marginVertical: 10, fontWeight: "bold" }}> {item.CUSTOMER_NAME}</Text>
                            {/* <Text style={styles.rowText}>
                                {i18n.t("customerType")}: {curLang === "ar" ? (item.CUST_TYPE === "Existing" ? "عميل موجود" : "عميل محتمل") : item.CUST_TYPE}
                            </Text> */}
                            <Text style={styles.rowText(curLang)}>{i18n.t("customerType")}: {item.CUST_TYPE}</Text>
                            <Text style={styles.rowText(curLang)}>{i18n.t("date")}: {item.DATE}</Text>
                            <Text style={styles.rowText(curLang)}>{i18n.t("inTime")}: {item.START_TIME}</Text>
                            <Text style={styles.rowText(curLang)}>{i18n.t("outTime")}: {item.END_TIME}</Text>
                            <Text style={styles.rowText(curLang)}>{i18n.t("username")}: {item.USER}</Text>
                            <Text style={styles.rowText(curLang)}>{i18n.t("visitType")}: {item.TYPE}</Text>
                            <Text style={styles.rowText(curLang)}>{i18n.t("visitcall")}: {item.VISIT_CALL}</Text>
                            {item.VISIT_CALL == "Call" && (<Text style={styles.rowText(curLang)}>{i18n.t("callDuration")}: {item.CALL_DURATION}</Text>)}
                        </TouchableOpacity>
                    )
                    }
                />
            </SafeAreaView >]
    );
};
const styles = StyleSheet.create({
    pickerStyle: {
        height: 50,
        width: width / 1.7
    },
    viewContainer: {
        width: "80%",
        marginTop: 80,
    },
    addButtonStyle: { color: "white" },
    text: { color: "white", fontWeight: "bold", fontSize: 16 },
    text2: { fontWeight: "bold", fontSize: 16, alignSelf: "center" },
    text3: { fontSize: 14, marginHorizontal: 5, alignSelf: "center" },
    taskItemView: curLang => ({
        marginBottom: 5,
        flexDirection: curLang == "ar" ? "row-reverse" : "row",
        justifyContent: "space-between",
        marginHorizontal: 20,

    }),
    rowText: curLang => ({
        marginVertical: 5,
        color: "black",
        textAlign: curLang === "ar" ? "right" : "left",
    }),
    cardContainer: {
        display: "flex",
        flex: 1,
        backgroundColor: "#fff",
        padding: 15
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
    refreshButton: {
        backgroundColor: Constants.appColor,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 10,
        alignSelf: "center",
    },
    refreshButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    modalTitle: { textAlign: "center", fontSize: 16, backgroundColor: Constants.appColor, color: "white", fontWeight: "bold", padding: 10, width: "100%" }
});
