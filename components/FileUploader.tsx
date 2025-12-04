import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FileText, Upload, X, CheckCircle, Download } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { COLORS } from '../constants/colors';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploaderProps {
    fileUrl?: string;
    onFileChange: (url: string) => void;
    label?: string;
    placeholder?: string;
}

export function FileUploader({
    fileUrl,
    onFileChange,
    label = 'ملف PDF',
    placeholder = 'اختر ملف PDF',
}: FileUploaderProps) {
    const { pickAndUploadFile, isLoading, error } = useFileUpload({
        onUploadSuccess: (url) => {
            onFileChange(url);
        },
    });

    const handleRemoveFile = () => {
        onFileChange('');
    };

    const handleDownload = () => {
        if (fileUrl) {
            Linking.openURL(fileUrl);
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            {!fileUrl ? (
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickAndUploadFile}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : (
                        <>
                            <Upload size={24} color={COLORS.primary} />
                            <Text style={styles.uploadText}>{placeholder}</Text>
                        </>
                    )}
                </TouchableOpacity>
            ) : (
                <View style={styles.fileContainer}>
                    <View style={styles.fileInfo}>
                        <FileText size={24} color={COLORS.success} />
                        <Text style={styles.fileName} numberOfLines={1}>
                            {fileUrl.split('/').pop()}
                        </Text>
                        <CheckCircle size={16} color={COLORS.success} />
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={handleDownload}
                    >
                        <Download size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={handleRemoveFile}
                    >
                        <X size={20} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'right',
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        gap: 8,
    },
    uploadText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    fileContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.success,
        borderRadius: 12,
        padding: 12,
    },
    fileInfo: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        color: COLORS.black,
        flex: 1,
        textAlign: 'right',
    },
    removeButton: {
        padding: 8,
    },
    errorText: {
        fontSize: 12,
        color: COLORS.error,
        marginTop: 4,
        textAlign: 'right',
    },
});
