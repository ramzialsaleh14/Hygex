import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, TextInput, Button, Checkbox } from 'react-native-paper';
import ProgressDialog from '../components/ProgressDialog';
import Color from 'react-native-material-color';
import * as ServerOperations from '../utils/ServerOperations';
import * as Commons from '../utils/Commons';
import i18n from '../languages/langStrings';
import { height, width } from '../utils/Styles';

const RemindersScreen = ({ route, navigation }) => {
    const { fromDate, toDate, isDone: isDoneFilter } = route.params || {};
    const [curLang, setCurLang] = useState('e');
    const [loading, setLoading] = useState(false);
    const [reminders, setReminders] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [isDone, setIsDone] = useState(false);
    const [replyNotes, setReplyNotes] = useState('');

    useEffect(() => {
        (async () => {
            const lang = await Commons.getFromAS('lang');
            setCurLang(lang || 'e');
            await loadReminders();
        })();
    }, []);

    const loadReminders = async () => {
        setLoading(true);
        try {
            const curUser = await Commons.getFromAS('userID');
            const res = await ServerOperations.getReminders(curUser, fromDate, toDate, isDoneFilter);
            if (res && Array.isArray(res)) {
                setReminders(res);
            } else if (res && res.length > 0) {
                setReminders(res);
            } else {
                setReminders([]);
            }
        } catch (err) {
            console.error('getReminders error', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReminderPress = (item) => {
        // Check if reminder is already responded (only check if isDone is 'Y')
        const isDoneValue = item.isDone || item.IS_DONE || item.ISDONE;

        // Don't open modal if reminder is already responded
        if (isDoneValue === 'Y') {
            return;
        }

        setSelectedReminder(item);
        setIsDone(false);
        setReplyNotes('');
        setModalVisible(true);
    };

    const handleSaveResponse = async () => {
        if (!selectedReminder) return;

        const reminderId = selectedReminder.id || selectedReminder.ID;
        const isDoneValue = isDone ? 'Y' : 'N';

        setModalVisible(false);
        setLoading(true);
        try {
            const result = await ServerOperations.respondToReminder(reminderId, isDoneValue, replyNotes);
            if (result) {
                Alert.alert(i18n.t('success'), i18n.t('reminderResponseSaved'));
                await loadReminders(); // Reload reminders
            } else {
                Alert.alert(i18n.t('error'), i18n.t('failedToSaveResponse'));
            }
        } catch (err) {
            console.error('respondToReminder error', err);
            Alert.alert(i18n.t('error'), i18n.t('failedToSaveResponse'));
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        // item expected: { id, fromDate, toDate, notes, customer, branch, isDone, replyNotes }
        const id = item.id || item.ID || '';
        const customer = item.customer || item.CUSTOMER || '';
        const branch = item.branch || item.BRANCH || '';
        const from = item.fromDate || item.FDT || '';
        const to = item.toDate || item.TDT || '';
        const notes = item.notes || item.NOTES || '';
        const isDoneValue = item.isDone || item.IS_DONE || item.ISDONE;
        const replyNotesValue = item.replyNotes || item.REPLY_NOTES || item.REPLYNOTES;

        // Check if reminder has been responded to (only check isDone is 'Y')
        const isResponded = isDoneValue === 'Y';

        return (
            <TouchableOpacity
                style={[styles.card, isResponded && styles.respondedCard]}
                onPress={isResponded ? null : () => handleReminderPress(item)}
                activeOpacity={isResponded ? 1 : 0.8}
            >
                <Text style={[styles.idText]}>{id}</Text>
                <Text style={[styles.cardTitle]}>{customer}</Text>
                {branch ? <Text style={[styles.rowText, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{i18n.t('branch')} : {branch}</Text> : null}
                <Text style={[styles.rowText, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{i18n.t('fromDate')} : {from}</Text>
                <Text style={[styles.rowText, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{i18n.t('toDate')} : {to}</Text>
                {notes ? <Text style={[styles.notes, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{notes}</Text> : null}

                {isResponded ? (
                    <View style={styles.respondedBadge}>
                        <Text style={styles.respondedText}>{i18n.t('responded')}</Text>
                    </View>
                ) : (
                    <View style={styles.tapIndicator}>
                        <Text style={styles.tapIndicatorText}>{i18n.t('tapToRespond')}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ProgressDialog visible={loading} />
            <FlatList
                data={reminders}
                extraData={reminders}
                keyExtractor={(it) => it.id?.toString() || it.ID?.toString() || Math.random().toString()}
                renderItem={renderItem}
                ListEmptyComponent={() => <View style={{ padding: 20 }}><Text>{i18n.t('noReminders')}</Text></View>}
            />

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>{i18n.t('reminderResponse')}</Text>

                    <View style={styles.checkboxRow}>
                        <Checkbox
                            status={isDone ? 'checked' : 'unchecked'}
                            onPress={() => setIsDone(!isDone)}
                        />
                        <Text style={styles.checkboxLabel}>{i18n.t('markAsDone')}</Text>
                    </View>

                    <TextInput
                        label={i18n.t('replyNotes')}
                        value={replyNotes}
                        onChangeText={setReplyNotes}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={styles.textInput}
                    />

                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={handleSaveResponse}
                            style={styles.saveButton}
                        >
                            {i18n.t('save')}
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => setModalVisible(false)}
                            style={styles.cancelButton}
                        >
                            {i18n.t('cancel')}
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
};

export default RemindersScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    card: {
        padding: 15,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Color.GREY[300] || '#ddd',
        borderRadius: 6,
        marginBottom: 8,
        backgroundColor: Color.GREY[50] || '#fafafa'
    },
    respondedCard: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4caf50',
    },
    respondedBadge: {
        marginTop: 10,
        padding: 5,
        backgroundColor: '#4caf50',
        borderRadius: 4,
        alignSelf: 'center',
    },
    respondedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    tapIndicator: {
        marginTop: 10,
        padding: 5,
        backgroundColor: '#2196f3',
        borderRadius: 4,
        alignSelf: 'center',
    },
    tapIndicatorText: {
        color: 'white',
        fontSize: 12,
    },
    idText: { color: 'red', fontWeight: 'bold', marginBottom: 8, alignSelf: 'center' },
    cardTitle: { fontWeight: 'bold', marginBottom: 8, alignSelf: 'center', fontSize: 16 },
    rowText: { color: 'black', marginBottom: 10, lineHeight: 20 },
    notes: { fontStyle: 'italic', color: '#333', marginTop: 8 },
    rightAlign: { textAlign: 'right' },
    leftAlign: { textAlign: 'left' },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkboxLabel: {
        fontSize: 16,
        marginLeft: 8,
    },
    textInput: {
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    saveButton: {
        flex: 1,
        marginRight: 10,
    },
    cancelButton: {
        flex: 1,
        marginLeft: 10,
    },
});
