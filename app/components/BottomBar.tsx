import React from "react";
import { TouchableOpacity, View } from "react-native";
import { appStyles } from "../styles/appStyles";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';

type BottomBarProps = {
    homePress: () => void;
    walletPress: () => void;
    transactionPress: () => void;
    settingsPress: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ homePress,  walletPress, transactionPress, settingsPress }) => {
    return (
        <View style={appStyles.bottomBarContainer}>
            <TouchableOpacity onPress={homePress}>
                <Ionicons name="home" size={40} color="#3C3C3C" />
            </TouchableOpacity>
            <TouchableOpacity onPress={walletPress}>
                <Entypo name="wallet" size={40} color="#3C3C3C" />
            </TouchableOpacity>
            <TouchableOpacity onPress={transactionPress}>
                <Octicons name="history" size={40} color="#3C3C3C" />
            </TouchableOpacity>
            <TouchableOpacity onPress={settingsPress}>
                <Ionicons name="settings-sharp" size={40} color="#3C3C3C" />
            </TouchableOpacity>
        </View>
    )
}
export default BottomBar;