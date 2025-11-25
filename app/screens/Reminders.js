import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressDialog from '../components/ProgressDialog';
import Color from 'react-native-material-color';
import * as ServerOperations from '../utils/ServerOperations';
import * as Commons from '../utils/Commons';
import i18n from '../languages/langStrings';
import { height, width } from '../utils/Styles';

const RemindersScreen = ({ route, navigation }) => {
    const { fromDate, toDate } = route.params || {};
    const [curLang, setCurLang] = useState('e');
    const [loading, setLoading] = useState(false);
    const [reminders, setReminders] = useState([]);

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
            const res = await ServerOperations.getReminders(curUser, fromDate, toDate);
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

    const renderItem = ({ item }) => {
        // item expected: { id, fromDate, toDate, notes, customer, branch }
        const id = item.id || item.ID || '';
        const customer = item.customer || item.CUSTOMER || '';
        const branch = item.branch || item.BRANCH || '';
        const from = item.fromDate || item.FDT || '';
        const to = item.toDate || item.TDT || '';
        const notes = item.notes || item.NOTES || '';

        return (
            <TouchableOpacity style={styles.card}>
                <Text style={[styles.idText]}>{id}</Text>
                <Text style={[styles.cardTitle]}>{customer}</Text>
                {branch ? <Text style={[styles.rowText, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{i18n.t('branch')} : {branch}</Text> : null}
                <Text style={[styles.rowText, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{i18n.t('fromDate')} : {from}</Text>
                <Text style={[styles.rowText, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{i18n.t('toDate')} : {to}</Text>
                {notes ? <Text style={[styles.notes, curLang === 'ar' ? styles.rightAlign : styles.leftAlign]}>{notes}</Text> : null}
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
    idText: { color: 'red', fontWeight: 'bold', marginBottom: 8, alignSelf: 'center' },
    cardTitle: { fontWeight: 'bold', marginBottom: 8, alignSelf: 'center', fontSize: 16 },
    rowText: { color: 'black', marginBottom: 10, lineHeight: 20 },
    notes: { fontStyle: 'italic', color: '#333', marginTop: 8 },
    rightAlign: { textAlign: 'right' },
    leftAlign: { textAlign: 'left' }
});
