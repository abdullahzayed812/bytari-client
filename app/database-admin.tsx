import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpc } from "../lib/trpc";

type TableData = {
  name: string;
  count: number;
  data: any[];
};

export default function DatabaseAdmin() {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any>(null);

  // Get all users
  const usersQuery = trpc.users.list.useQuery({ limit: 100, offset: 0 });
  
  // Mock data for demonstration - في التطبيق الحقيقي ستحتاج إلى إنشاء tRPC procedures للحصول على بيانات الجداول
  const tables = [
    { name: 'users', count: usersQuery.data?.count || 0 },
    { name: 'pets', count: 0 },
    { name: 'appointments', count: 0 },
    { name: 'inquiries', count: 0 },
    { name: 'admin_permissions', count: 0 },
    { name: 'messages', count: 0 },
    { name: 'ads', count: 0 },
    { name: 'content', count: 0 },
  ];

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    // هنا ستحتاج إلى إنشاء tRPC procedure للحصول على بيانات الجدول المحدد
    if (tableName === 'users') {
      setTableData(usersQuery.data?.users || []);
    } else {
      setTableData([]);
    }
  };

  const executeQuery = () => {
    if (!sqlQuery.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال استعلام SQL');
      return;
    }
    
    // هنا ستحتاج إلى إنشاء tRPC procedure لتنفيذ استعلامات SQL مخصصة
    Alert.alert('تنبيه', 'هذه الميزة تحتاج إلى تطوير إضافي في الـ backend');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة قاعدة البيانات',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
        }} 
      />
      
      <ScrollView style={styles.content}>
        {/* قائمة الجداول */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الجداول المتاحة</Text>
          <View style={styles.tablesGrid}>
            {tables.map((table) => (
              <TouchableOpacity
                key={table.name}
                style={[
                  styles.tableCard,
                  selectedTable === table.name && styles.selectedTableCard
                ]}
                onPress={() => handleTableSelect(table.name)}
              >
                <Text style={styles.tableName}>{table.name}</Text>
                <Text style={styles.tableCount}>{table.count} سجل</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* بيانات الجدول المحدد */}
        {selectedTable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات جدول {selectedTable}</Text>
            <ScrollView horizontal style={styles.tableContainer}>
              <View>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <View key={index} style={styles.dataRow}>
                      <Text style={styles.dataText}>
                        {JSON.stringify(row, null, 2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noData}>لا توجد بيانات</Text>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* محرر SQL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>محرر SQL</Text>
          <TextInput
            style={styles.sqlInput}
            value={sqlQuery}
            onChangeText={setSqlQuery}
            placeholder="أدخل استعلام SQL هنا..."
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.executeButton} onPress={executeQuery}>
            <Text style={styles.executeButtonText}>تنفيذ الاستعلام</Text>
          </TouchableOpacity>
        </View>

        {/* نتيجة الاستعلام */}
        {queryResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نتيجة الاستعلام</Text>
            <ScrollView style={styles.resultContainer}>
              <Text style={styles.resultText}>
                {JSON.stringify(queryResult, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* معلومات قاعدة البيانات */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات قاعدة البيانات</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>نوع قاعدة البيانات: SQLite</Text>
            <Text style={styles.infoText}>موقع الملف: ./database.db</Text>
            <Text style={styles.infoText}>إجمالي الجداول: {tables.length}</Text>
          </View>
        </View>

        {/* تعليمات الاستخدام */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تعليمات الاستخدام</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionText}>• اضغط على أي جدول لعرض بياناته</Text>
            <Text style={styles.instructionText}>• استخدم محرر SQL لتنفيذ استعلامات مخصصة</Text>
            <Text style={styles.instructionText}>• يمكنك أيضاً استخدام Drizzle Studio بالأمر:</Text>
            <Text style={styles.codeText}>npx drizzle-kit studio</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'right',
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tableCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
    alignItems: 'center',
  },
  selectedTableCard: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  tableName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  tableCount: {
    fontSize: 12,
    color: '#64748b',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 300,
  },
  dataRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dataText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  noData: {
    padding: 20,
    textAlign: 'center',
    color: '#64748b',
  },
  sqlInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  executeButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  executeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
    padding: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  codeText: {
    fontSize: 12,
    color: '#2563eb',
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});