import { View, Text, TouchableOpacity, Image, Linking } from "react-native";

import styles from "./footer.style";
import { icons } from "../../constants";
import { useNavigation } from '@react-navigation/native';


const Footer = ({ url }) => {
  const navigation = useNavigation();
  const handleChatNavigation = ()=>{

    navigation.navigate('ChatScreen');
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.likeBtn}>
        <Image
          source={icons.heartOutline}
          resizeMode='contain'
          style={styles.likeBtnImage}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.applyBtn}
        // navigate to the chat page  
        onPress={handleChatNavigation}
      >
        <Text style={styles.applyBtnText}>Request Service </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Footer;