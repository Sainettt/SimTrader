import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // 1. Импорт навигации
import { AuthContext } from '../../context/AuthContext';

const SettingsScreen = () => {
    const navigation = useNavigation(); // 2. Хук для навигации
    const { logout, userInfo } = useContext(AuthContext);

    return (
        <SafeAreaView style={styles.container}>
            {/* Заголовок с кнопкой назад */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Увеличиваем область нажатия
                >
                    <Icon name="arrow-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                
                {/* Секция Профиля */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.card}>
                        <View style={styles.userInfoRow}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.username}>{userInfo?.username || 'User'}</Text>
                                <Text style={styles.email}>{userInfo?.email || 'email@example.com'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Секция Настроек */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingItemLeft}>
                            <Icon name="language-outline" size={22} color="#D9D9D9" />
                            <Text style={styles.settingText}>Language</Text>
                        </View>
                        <Text style={styles.settingValue}>English</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingItemLeft}>
                            <Icon name="notifications-outline" size={22} color="#D9D9D9" />
                            <Text style={styles.settingText}>Notifications</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color="#9D9C9C" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingItemLeft}>
                            <Icon name="shield-checkmark-outline" size={22} color="#D9D9D9" />
                            <Text style={styles.settingText}>Security</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color="#9D9C9C" />
                    </TouchableOpacity>
                </View>

                {/* Кнопка выхода */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Log Out</Text>
                        <Icon name="log-out-outline" size={20} color="#EB5B5B" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3C3C3C',
    },
    header: {
        flexDirection: 'row', // Выстраиваем кнопку и текст в ряд
        alignItems: 'center', // Центрируем по вертикали
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    backButton: {
        marginRight: 15, // Отступ между стрелкой и заголовком
    },
    headerText: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#FFFFFF',
        // Убираем lineHeight, если он мешает выравниванию, или подстраиваем его
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: '#D9D9D9',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        textTransform: 'uppercase',
        fontFamily: 'Poppins-SemiBold',
    },
    card: {
        backgroundColor: '#636363',
        borderRadius: 12,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#83EDA6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#3C3C3C',
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
    },
    username: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
    },
    email: {
        color: '#D9D9D9',
        fontSize: 14,
        marginTop: 2,
        fontFamily: 'Poppins-Regular',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#636363',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
    },
    settingValue: {
        color: '#D9D9D9',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    logoutContainer: {
        marginTop: 10,
        marginBottom: 50,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(235, 91, 91, 0.15)',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(235, 91, 91, 0.5)',
    },
    logoutText: {
        color: '#EB5B5B',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
        fontFamily: 'Poppins-SemiBold',
    },
});

export default SettingsScreen;