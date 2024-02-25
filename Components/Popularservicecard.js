import { View, Text, TouchableOpacity, Image } from "react-native";

import styles from '../Styles/cardstyles';
import { checkImageURL } from '../utils';
const Popularcardservice = ({item,selectedService,handleCardPress}) =>{

return(
<TouchableOpacity
style={styles.container(selectedService, item)}
onPress={() => handleCardPress(item)}
>
    <TouchableOpacity
    style={styles.logoContainer(selectedService,item)}
    >
        <Image
        
/* TODO... add test dumy images */ 
source={{
    uri: checkImageURL(item?.employer_logo)
      ? item.employer_logo
      : "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg",
  }}
        resizeMode="contain"
        style={styles.logoImage}
        />

        <Text style={styles.providerName} numberOfLines={1}>
        {item.employer_name}
        </Text>
        <View style={styles.infoContainer}>
        <Text style={styles.jobName(selectedService, item)} numberOfLines={1}>
          {item.job_title}
        </Text>
        <View style={styles.infoWrapper}>
          <Text style={styles.publisher(selectedService, item)}>
            {item?.job_publisher} -
          </Text>
          <Text style={styles.location}> {item.job_country}</Text>
        </View>
      </View>
    </TouchableOpacity>
</TouchableOpacity>
);
}

export default  Popularcardservice;