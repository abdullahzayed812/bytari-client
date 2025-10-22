import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Search, Building2, Heart, ShoppingBag, User, X, BookOpen, Lightbulb, Package } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { mockClinics, mockPets } from "../../mocks/data";
import { useApp } from "../../providers/AppProvider";

interface SearchResult {
  id: string;
  type: 'clinic' | 'pet' | 'product' | 'user' | 'tip' | 'book' | 'article' | 'warehouse';
  title: string;
  subtitle?: string;
  image?: string;
  description?: string;
}

export default function SearchScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { userMode } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Simulate search delay
    setTimeout(() => {
      const results: SearchResult[] = [];

      // Search based on user mode
      if (userMode === 'pet_owner') {
        // Pet owners can search for: clinics, store products, tips
        // Search in clinics
        mockClinics.forEach(clinic => {
          if (clinic.name.toLowerCase().includes(query.toLowerCase()) ||
              clinic.address.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              id: clinic.id,
              type: 'clinic',
              title: clinic.name,
              subtitle: clinic.address,
              image: clinic.image,
              description: `تقييم: ${clinic.rating} ⭐`,
            });
          }
        });

        // Search in store products
        if (query.toLowerCase().includes('طعام') || query.toLowerCase().includes('food') || 
            query.toLowerCase().includes('منتج') || query.toLowerCase().includes('product')) {
          results.push({
            id: 'product1',
            type: 'product',
            title: 'طعام القطط الممتاز',
            subtitle: 'طعام صحي ومتوازن للقطط',
            image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80',
            description: 'السعر: 45 ريال',
          });
          results.push({
            id: 'product2',
            type: 'product',
            title: 'ألعاب الكلاب التفاعلية',
            subtitle: 'ألعاب آمنة ومسلية للكلاب',
            image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            description: 'السعر: 25 ريال',
          });
        }

        // Search in tips
        if (query.toLowerCase().includes('نصيحة') || query.toLowerCase().includes('tip') ||
            query.toLowerCase().includes('رعاية') || query.toLowerCase().includes('تربية')) {
          results.push({
            id: 'tip1',
            type: 'tip',
            title: 'كيفية رعاية القطط الصغيرة',
            subtitle: 'نصائح مهمة لرعاية القطط حديثة الولادة',
            image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
            description: 'نصائح من الخبراء',
          });
          results.push({
            id: 'tip2',
            type: 'tip',
            title: 'التغذية السليمة للكلاب',
            subtitle: 'دليل شامل لتغذية الكلاب بطريقة صحية',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2062&q=80',
            description: 'معلومات مفيدة',
          });
        }
      } else if (userMode === 'veterinarian') {
        // Veterinarians can search for: warehouses, books, articles, store products
        // Search in warehouses
        if (query.toLowerCase().includes('مذخر') || query.toLowerCase().includes('warehouse') ||
            query.toLowerCase().includes('أدوية') || query.toLowerCase().includes('medicine')) {
          results.push({
            id: 'warehouse1',
            type: 'warehouse',
            title: 'مذخر الأدوية البيطرية المركزي',
            subtitle: 'أدوية وأجهزة طبية بيطرية',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            description: 'متوفر 24/7',
          });
          results.push({
            id: 'warehouse2',
            type: 'warehouse',
            title: 'مذخر المعدات الطبية',
            subtitle: 'أجهزة وأدوات طبية متخصصة',
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
            description: 'معدات حديثة',
          });
        }

        // Search in books
        if (query.toLowerCase().includes('كتاب') || query.toLowerCase().includes('book') ||
            query.toLowerCase().includes('مرجع') || query.toLowerCase().includes('دراسة')) {
          results.push({
            id: 'book1',
            type: 'book',
            title: 'أساسيات الطب البيطري',
            subtitle: 'كتاب شامل في الطب البيطري',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2086&q=80',
            description: 'مرجع علمي موثق',
          });
          results.push({
            id: 'book2',
            type: 'book',
            title: 'جراحة الحيوانات الصغيرة',
            subtitle: 'دليل متقدم في الجراحة البيطرية',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80',
            description: 'للأطباء المتخصصين',
          });
        }

        // Search in articles
        if (query.toLowerCase().includes('مقال') || query.toLowerCase().includes('article') ||
            query.toLowerCase().includes('بحث') || query.toLowerCase().includes('دراسة')) {
          results.push({
            id: 'article1',
            type: 'article',
            title: 'أحدث التطورات في علاج السرطان البيطري',
            subtitle: 'مقال علمي حديث',
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            description: 'بحث متقدم',
          });
          results.push({
            id: 'article2',
            type: 'article',
            title: 'تقنيات التشخيص الحديثة',
            subtitle: 'استخدام التكنولوجيا في التشخيص',
            image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
            description: 'تقنيات متطورة',
          });
        }

        // Search in store products (veterinarians can also search products)
        if (query.toLowerCase().includes('منتج') || query.toLowerCase().includes('product') ||
            query.toLowerCase().includes('أداة') || query.toLowerCase().includes('جهاز')) {
          results.push({
            id: 'product3',
            type: 'product',
            title: 'جهاز قياس الضغط البيطري',
            subtitle: 'جهاز دقيق لقياس ضغط الدم',
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
            description: 'للاستخدام المهني',
          });
        }
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'clinic':
        return <Building2 size={20} color={COLORS.primary} />;
      case 'pet':
        return <Heart size={20} color={COLORS.success} />;
      case 'product':
        return <ShoppingBag size={20} color={COLORS.warning} />;
      case 'user':
        return <User size={20} color={COLORS.darkGray} />;
      case 'tip':
        return <Lightbulb size={20} color={COLORS.success} />;
      case 'book':
        return <BookOpen size={20} color={COLORS.primary} />;
      case 'article':
        return <BookOpen size={20} color={COLORS.secondary} />;
      case 'warehouse':
        return <Package size={20} color={COLORS.warning} />;
      default:
        return <Search size={20} color={COLORS.darkGray} />;
    }
  };

  const handleResultPress = (result: SearchResult) => {
    console.log('Search result pressed:', result);
    // Handle navigation based on result type
    switch (result.type) {
      case 'clinic':
        router.push({ pathname: '/clinic-profile', params: { id: result.id } });
        break;
      case 'pet':
        router.push({ pathname: '/pet-details', params: { id: result.id } });
        break;
      case 'product':
        router.push({ pathname: '/product-details', params: { id: result.id } });
        break;
      case 'tip':
        router.push({ pathname: '/tip-details', params: { id: result.id } });
        break;
      case 'book':
        router.push({ pathname: '/book-details', params: { id: result.id } });
        break;
      case 'article':
        router.push({ pathname: '/article-details', params: { id: result.id } });
        break;
      case 'warehouse':
        router.push({ pathname: '/warehouse-products', params: { id: result.id } });
        break;
      default:
        console.log('Unknown result type:', result.type);
    }
  };

  const getRecentSearches = () => {
    if (userMode === 'pet_owner') {
      return ['عيادة الرحمة', 'طعام القطط', 'نصائح الرعاية', 'منتجات الحيوانات'];
    } else if (userMode === 'veterinarian') {
      return ['مذخر الأدوية', 'كتب الطب البيطري', 'أحدث الأبحاث', 'أجهزة طبية'];
    }
    return ['البحث العام'];
  };

  const recentSearches = getRecentSearches();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'البحث',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.black,
            fontSize: 18,
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              {isRTL ? (
                <ArrowRight size={24} color={COLORS.black} />
              ) : (
                <ArrowLeft size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        {/* Search Input */}
        <View style={[styles.searchContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Search size={20} color={COLORS.darkGray} style={[styles.searchIcon, { marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }]} />
          <TextInput
            style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={userMode === 'pet_owner' 
              ? "ابحث عن العيادات، المنتجات، النصائح..."
              : "ابحث عن المذاخر، الكتب، المقالات، المنتجات..."
            }
            placeholderTextColor={COLORS.lightGray}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {searchQuery.length === 0 ? (
            // Recent searches and suggestions
            <View>
              <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                عمليات البحث الأخيرة
              </Text>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => handleSearch(search)}
                >
                  <View style={[styles.recentSearchContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Search size={16} color={COLORS.lightGray} />
                    <Text style={[styles.recentSearchText, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0, textAlign: isRTL ? 'right' : 'left' }]}>
                      {search}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left', marginTop: 32 }]}>
                اقتراحات البحث
              </Text>
              <View style={styles.suggestionsContainer}>
                {(userMode === 'pet_owner' 
                  ? ['العيادات البيطرية', 'منتجات الحيوانات', 'نصائح الرعاية', 'طعام الحيوانات']
                  : ['المذاخر الطبية', 'الكتب العلمية', 'المقالات البحثية', 'الأجهزة الطبية']
                ).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSearch(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : isSearching ? (
            // Loading state
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>جاري البحث...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            // Search results
            <View>
              <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                نتائج البحث ({searchResults.length})
              </Text>
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultCard}
                  onPress={() => handleResultPress(result)}
                >
                  <View style={[styles.resultContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={styles.resultImageContainer}>
                      {result.image ? (
                        <Image source={{ uri: result.image }} style={styles.resultImage} />
                      ) : (
                        <View style={styles.resultIconContainer}>
                          {getResultIcon(result.type)}
                        </View>
                      )}
                    </View>
                    
                    <View style={[styles.resultTextContainer, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                      <Text style={[styles.resultTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {result.title}
                      </Text>
                      {result.subtitle && (
                        <Text style={[styles.resultSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                          {result.subtitle}
                        </Text>
                      )}
                      {result.description && (
                        <Text style={[styles.resultDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                          {result.description}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // No results
            <View style={styles.noResultsContainer}>
              <Search size={64} color={COLORS.lightGray} />
              <Text style={styles.noResultsText}>لا توجد نتائج</Text>
              <Text style={styles.noResultsSubtext}>جرب البحث بكلمات مختلفة</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    // marginRight handled in JSX
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  recentSearchItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recentSearchContent: {
    alignItems: 'center',
  },
  recentSearchText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultContent: {
    alignItems: 'flex-start',
  },
  resultImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTextContainer: {
    justifyContent: 'flex-start',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
});