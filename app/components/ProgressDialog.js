import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import i18n from '../languages/langStrings';

const ProgressDialog = ({ visible, message }) => {
    return (
        <Portal>
            <Modal visible={visible} dismissable={false} contentContainerStyle={styles.modalStyle}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    {message && <Text style={styles.message}>{message}</Text>}
                    {!message && <Text style={styles.message}>{i18n.t("loading")}</Text>}
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Remove the black background
    },
    container: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5, // Add shadow for better visibility
    },
    message: {
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ProgressDialog;