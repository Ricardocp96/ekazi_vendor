import { View, Text, TouchableOpacity, Image, Linking } from "react-native";

import styles from "./footer.style";
import { icons } from "../../constants";


const Footer = ({ url }) => {
  const handleChatNavigation = ()=>{
    // TODO: Navigate to chat
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