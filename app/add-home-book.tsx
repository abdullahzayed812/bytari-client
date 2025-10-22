import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Search, Check } from 'lucide-react-native';
import Button from "../components/Button";
import { mockVetBooks } from "../mocks/data";

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  downloads: number;
  pages: number;
  category?: string;
};

export default function AddHomeBookScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  
  // Get books from main section that are not already in home
  const availableBooks = mockVetBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleBook = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleImportSelected = () => {
    if (selectedBooks.length === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار كتاب واحد على الأقل');
      return;
    }

    Alert.alert(
      'استيراد الكتب',
      `هل تريد استيراد ${selectedBooks.length} كتاب إلى الصفحة الرئيسية؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استيراد',
          onPress: () => {
            // Here you would save the selected books to home section
            console.log('Importing books:', selectedBooks);
            Alert.alert('نجح', `تم استيراد ${selectedBooks.length} كتاب بنجاح`);
            router.back();
          }
        }
      ]
    );
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const isSelected = selectedBooks.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.bookItem, isSelected && styles.selectedBookItem]}
        onPress={() => handleToggleBook(item.id)}
      >
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
          <Text style={styles.bookDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.bookStats}>
            <Text style={styles.statText}>{item.pages} صفحة</Text>
            <Text style={styles.statText}>{item.downloads} تحميل</Text>
          </View>
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Check size={16} color={COLORS.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'استيراد كتب للصفحة الرئيسية',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="البحث في الكتب..."
              textAlign="right"
            />
          </View>
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>اختر الكتب للاستيراد</Text>
          <Text style={styles.headerSubtitle}>
            اختر الكتب من القسم الأساسي لإضافتها للصفحة الرئيسية
          </Text>
          {selectedBooks.length > 0 && (
            <Text style={styles.selectedCount}>
              تم اختيار {selectedBooks.length} كتاب
            </Text>
          )}
        </View>
        
        {/* Books List */}
        <FlatList
          data={availableBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          style={styles.booksList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد كتب متاحة'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Footer */}
      {selectedBooks.length > 0 && (
        <View style={styles.footer}>
          <Button
            title={`استيراد ${selectedBooks.length} كتاب`}
            onPress={handleImportSelected}
            type="primary"
            size="large"
            icon={<Plus size={20} color={COLORS.white} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: 8,
  },
  selectedCount: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  booksList: {
    flex: 1,
  },
  bookItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBookItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 6,
  },
  bookAuthor: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 8,
  },
  bookDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 18,
    marginBottom: 8,
  },
  bookStats: {
    flexDirection: 'row-reverse',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});