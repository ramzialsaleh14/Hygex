import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, Linking, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Button, TextInput, List, Portal } from 'react-native-paper';
import i18n from "../languages/langStrings";
import { StyleSheet } from 'react-native';
import * as Constants from "../utils/Constants";
import { height } from "../utils/Styles";
import * as ServerOperations from "../utils/ServerOperations";
import * as Commons from "../utils/Commons";

export const CustomerContacts = ({
    contactsList,
    setContactsList,
    customer,
    customerType,
    visible,
    onDismiss,
    curLang
}) => {
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [newContactName, setNewContactName] = useState("");
    const [newContactPosition, setNewContactPosition] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");
    const [newContactEmail, setNewContactEmail] = useState("");
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedDepartmentEnDesc, setSelectedDepartmentEnDesc] = useState("");
    const [selectedDepartmentArDesc, setSelectedDepartmentArDesc] = useState("");
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const deps = await ServerOperations.getDepartments();
            if (deps != null && deps != "" && deps != undefined) {
                setDepartments(deps);
                setFilteredDepartments(deps);
            }
        } catch (error) {
            console.error("Error loading departments:", error);
        }
    };

    const renderDepartmentItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    setSelectedDepartment(item.ID);
                    setSelectedDepartmentEnDesc(item.EN_DESC);
                    setSelectedDepartmentArDesc(item.AR_DESC);
                    setShowDepartmentsModal(false);
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

    const renderDepartmentsModal = () => (
        <Modal visible={showDepartmentsModal} onDismiss={() => setShowDepartmentsModal(false)} contentContainerStyle={styles.modalStyle}>
            <TextInput
                placeholder={i18n.t("search")}
                clearButtonMode="always"
                style={styles.searchBox}
                value={searchText}
                onChangeText={(text) => {
                    setSearchText(text);
                    const list = Commons.handleSearch(text, departments);
                    setFilteredDepartments(list);
                }}
            />
            <Text style={styles.modalTitle}>
                {i18n.t("departments")}
            </Text>
            <FlatList
                keyExtractor={(item) => item.ID}
                data={filteredDepartments}
                extraData={filteredDepartments}
                renderItem={renderDepartmentItem}
            />
            <Button mode="contained" style={{ borderRadius: 0 }} onPress={async () => {
                setShowDepartmentsModal(false);
            }}>
                <Text style={styles.text}>{i18n.t("back")}</Text>
            </Button>

        </Modal>


    );

    const handleAddContact = async () => {
        if (newContactName.trim() === "") {
            Alert.alert(i18n.t("error"), i18n.t("emptyNameError"));
            return;
        }
        if (newContactPhone.trim() === "") {
            Alert.alert(i18n.t("error"), i18n.t("emptyPhoneError"));
            return;
        }
        const contactExists = contactsList.some(contact => contact.PHONE === newContactPhone);
        if (contactExists) {
            Alert.alert(i18n.t("error"), i18n.t("contactAlreadyAdded"));
            return;
        }

        const resp = await ServerOperations.addContact(customer, customerType, newContactName, newContactPosition, newContactPhone, newContactEmail, selectedDepartment);
        if (resp.res) {
            Commons.okAlert(i18n.t("success"), i18n.t("contactAddedSuccessfully"));
            const newContact = {
                NAME: newContactName,
                POSITION: newContactPosition,
                PHONE: newContactPhone,
                EMAIL: newContactEmail,
                DEPARTMENT: selectedDepartment,
                DEP_EN: selectedDepartmentEnDesc,
                DEP_AR: selectedDepartmentArDesc
            };

            setContactsList([...contactsList, newContact]);
            setShowAddContactModal(false);
            clearForm();
        } else {
            Alert.alert(i18n.t("error"), i18n.t("notSent"));
            return;
        }

    };

    const clearForm = () => {
        setNewContactName("");
        setNewContactPosition("");
        setNewContactPhone("");
        setNewContactEmail("");
        setSelectedDepartment("");
        setSelectedDepartmentEnDesc("");
        setSelectedDepartmentArDesc("");
    };

    const renderAddContactModal = () => {
        return (
            <Modal visible={showAddContactModal} onDismiss={() => setShowAddContactModal(false)} contentContainerStyle={styles.modalStyle}>
                <Text style={styles.modalTitle}>{i18n.t("addContact")}</Text>
                <TextInput
                    label={i18n.t("name")}
                    value={newContactName}
                    onChangeText={setNewContactName}
                    style={styles.input}
                />
                <TextInput
                    label={i18n.t("position")}
                    value={newContactPosition}
                    onChangeText={setNewContactPosition}
                    style={styles.input}
                />
                <TextInput
                    label={i18n.t("phone")}
                    value={newContactPhone}
                    onChangeText={setNewContactPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                />
                <TextInput
                    label={i18n.t("email")}
                    value={newContactEmail}
                    onChangeText={setNewContactEmail}
                    style={styles.input}
                    keyboardType="email-address"
                />
                <TouchableOpacity onPress={() => setShowDepartmentsModal(true)}>
                    <TextInput
                        label={i18n.t("department")}
                        value={(curLang === 'en' ? selectedDepartmentEnDesc : selectedDepartmentArDesc)}
                        editable={false}
                    />
                </TouchableOpacity>

                <Button icon="content-save" mode="contained" onPress={handleAddContact}>
                    <Text style={styles.buttonText}>{i18n.t("save")}</Text>
                </Button>
            </Modal>
        );
    };

    return (
        [<Portal>{showAddContactModal && renderAddContactModal()}</Portal>,
        <Portal>{showDepartmentsModal && renderDepartmentsModal()}</Portal>,
            , <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalStyle}>
            <Text style={styles.modalTitle}>
                {i18n.t("contacts")}
            </Text>
            <Button
                style={styles.addButton}
                icon="account-plus"
                mode="outlined"
                onPress={() => setShowAddContactModal(true)}
            >
                <Text style={styles.text}>{i18n.t("addContact")}</Text>
            </Button>
            <FlatList
                keyExtractor={(item) => item.PHONE}
                data={contactsList}
                extraData={contactsList}
                renderItem={({ item }) => (
                    <View style={styles.contactItem}>
                        <Text style={styles.contactName}>{item.NAME}</Text>
                        {item.POSITION && (<Text>{i18n.t("position")}: {item.POSITION}</Text>)}
                        <Text>{i18n.t("phone")}: {item.PHONE}</Text>
                        {item.EMAIL && <Text>{i18n.t("email")}: {item.EMAIL}</Text>}
                        {curLang == "en" && item.DEP_EN &&
                            <Text>{i18n.t("department")}: {item.DEP_EN}</Text>
                        }
                        {curLang == "ar" && item.DEP_AR &&
                            <Text>{i18n.t("department")}: {item.DEP_AR}</Text>
                        }
                        <Button
                            style={styles.callButton}
                            icon="phone"
                            mode="outlined"
                            onPress={() => openDialer(item.PHONE)}
                        >
                            <Text style={styles.text}>{i18n.t("call")}</Text>
                        </Button>
                    </View>
                )}
            />
            <Button mode="contained" style={styles.backButton} onPress={onDismiss}>
                <Text style={styles.buttonText}>{i18n.t("back")}</Text>
            </Button>
        </Modal>]
    );
};

const styles = StyleSheet.create({
    modalStyle: {
        backgroundColor: "white",
        padding: 20,
        maxHeight: height - 50,
    },
    modalTitle: {
        textAlign: "center",
        fontSize: 16,
        backgroundColor: Constants.appColor,
        color: "white",
        fontWeight: "bold",
        padding: 10,
        width: "100%"
    },
    input: {
        marginBottom: 10
    },
    contactItem: {
        padding: 15,
        borderWidth: 0.5,
        borderRadius: 5,
        marginBottom: 5
    },
    contactName: {
        color: "red",
        alignSelf: "center"
    },
    text: {
        fontWeight: "bold",
        fontSize: 16,
        alignSelf: "center"
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16
    },
    addButton: {
        marginTop: 10,
        marginBottom: 10
    },
    callButton: {
        marginTop: 10
    },
    backButton: {
        borderRadius: 0,
        marginTop: 10
    }
});

export default CustomerContacts;