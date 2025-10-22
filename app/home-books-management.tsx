import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Edit3, Eye, EyeOff, Trash2, Download, Upload } from 'lucide-react-native';
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
  isSelectedForHome: boolean;
};

export default function HomeBooksManagementScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>(
    mockVetBooks.map(book => ({
      ...book,
      isSelectedForHome: book.isSelectedForHome || false
    }))
  );

  const handleToggleHomeVisibility = (bookId: string) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { ...book, isSelectedForHome: !book.isSelectedForHome }
          : book
      )
    );
  };

  const handleDeleteBook = (bookId: string) => {
    Alert.alert(
      'حذف الكتاب',
      'هل أنت متأكد من حذف هذا الكتاب من الصفحة الرئيسية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
          }
        }
      ]
    );
  };

  const handleEditBook = (bookId: string) => {
    router.push({ pathname: '/edit-book', params: { id: bookId } });
  };

  const handleAddBook = () => {
    router.push('/add-book');
  };

  const handleImportBooks = () => {
    // Get all available books from main sections that are not already selected for home
    const availableBooks = mockVetBooks.filter(book => 
      !books.some(homeBook => homeBook.id === book.id)
    );

    if (availableBooks.length === 0) {
      Alert.alert('لا توجد كتب', 'جميع الكتب المتاحة موجودة بالفعل في الصفحة الرئيسية');
      return;
    }

    Alert.alert(
      'استيراد الكتب',
      `تم العثور على ${availableBooks.length} كتاب متاح للاستيراد. هل تريد استيرادها جميعاً؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استيراد الكل',
          onPress: () => {
            const importedBooks = availableBooks.map(book => ({
              id: book.id,
              title: book.title,
              author: book.author,
              description: book.description,
              image: book.image,
              downloads: book.downloads,
              pages: book.pages,
              isSelectedForHome: true
            }));
            setBooks(prevBooks => [...prevBooks, ...importedBooks]);
            Alert.alert('تم الاستيراد', `تم استيراد ${importedBooks.length} كتاب بنجاح`);
          }
        },
        {
          text: 'اختيار يدوي',
          onPress: () => {
            // Show selection modal (for now, import first 3)
            const selectedBooks = availableBooks.slice(0, 3).map(book => ({
              id: book.id,
              title: book.title,
              author: book.author,
              description: book.description,
              image: book.image,
              downloads: book.downloads,
              pages: book.pages,
              isSelectedForHome: true
            }));
            setBooks(prevBooks => [...prevBooks, ...selectedBooks]);
            Alert.alert('تم الاستيراد', `تم استيراد ${selectedBooks.length} كتاب بنجاح`);
          }
        }
      ]
    );
  };

  const visibleBooks = books.filter(book => book.isSelectedForHome);
  const hiddenBooks = books.filter(book => !book.isSelectedForHome);

  const renderBookCard = (book: Book, isVisible: boolean) => (
    <View key={book.id} style={styles.bookCard}>
      <View style={styles.bookCardContent}>
        <Image source={{ uri: book.image }} style={styles.bookImage} />
        
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
          <Text style={styles.bookDescription} numberOfLines={2}>{book.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Download size={14} color="#10B981" />
              <Text style={styles.statText}>{book.downloads}</Text>
            </View>
            <Text style={styles.pagesText}>{book.pages} صفحة</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.bookActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.visibilityButton]}
          onPress={() => handleToggleHomeVisibility(book.id)}
        >
          {isVisible ? (
            <EyeOff size={16} color={COLORS.white} />
          ) : (
            <Eye size={16} color={COLORS.white} />
          )}
          <Text style={styles.actionButtonText}>
            {isVisible ? 'إخفاء' : 'إظهار'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditBook(book.id)}
        >
          <Edit3 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تعديل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBook(book.id)}
        >
          <Trash2 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة الكتب - الصفحة الرئيسية',
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
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة الكتب البيطرية</Text>
          <Text style={styles.headerSubtitle}>
            تحكم في الكتب التي تظهر في الصفحة الرئيسية
          </Text>
        </View>
        
        {/* Add Book Button */}
        <View style={styles.addSection}>
          <View style={styles.buttonRow}>
            <Button
              title="إضافة كتاب جديد"
              onPress={handleAddBook}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.halfButton}
            />
            <Button
              title="استيراد من الأقسام"
              onPress={handleImportBooks}
              type="secondary"
              size="medium"
              icon={<Upload size={16} color={COLORS.primary} />}
              style={styles.halfButton}
            />
          </View>
        </View>
        
        {/* Visible Books Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            الكتب المعروضة في الصفحة الرئيسية ({visibleBooks.length})
          </Text>
          {visibleBooks.length > 0 ? (
            visibleBooks.map(book => renderBookCard(book, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد كتب معروضة في الصفحة الرئيسية</Text>
            </View>
          )}
        </View>
        
        {/* Hidden Books Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            الكتب المخفية ({hiddenBooks.length})
          </Text>
          {hiddenBooks.length > 0 ? (
            hiddenBooks.map(book => renderBookCard(book, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد كتب مخفية</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  addSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  addButton: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 15,
  },
  bookCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  bookDetails: {
    flex: 1,
    marginRight: 16,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 6,
    lineHeight: 22,
  },
  bookAuthor: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 8,
  },
  bookDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 18,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  pagesText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  bookActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  visibilityButton: {
    backgroundColor: COLORS.info,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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