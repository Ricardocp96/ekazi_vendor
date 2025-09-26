import {useState} from 'react';
import {Text,View,TouchableOpacity, FlatList,ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import styles  from './style';
import {COLORS,SIZES, FONT, SHADOWS,} from '../constants'
import Popularservicecard from './Popularservicecard';
import useFetch from '../hooks/useFetch';

const Popularservices = () => {
    const router = useRouter();
const { data, isLoading, error } = useFetch( {
    
  });
  const [selectedJob, setSelectedJob] = useState();

  const handleCardPress = (item) => {

    //console.log(router)
   
    // TODO: Navigate to details
    //router.push(`Service_details/${item.id}`);
    //setSelectedJob(item.id);
  };

    return(
<View style={styles.container}>
<View style={styles.header}>
<Text style={styles.headerTitle}>Popular services

</Text>
<TouchableOpacity>
    <Text style={styles.headerBtn}> Show all </Text>
</TouchableOpacity>
</View>

<View style={styles.cardContainer}>

{isLoading ? ( 

    <ActivityIndicator size="large" colors={COLORS.primary}/>
): error ?(
    <Text>Somethhing went wrong</Text>
) :(
    <FlatList
        data={data}
        renderItem={({item}) =>(
            <Popularservicecard
            item={item}
            selectedJob={selectedJob}
            handleCardPress={handleCardPress}
            />
        )}
        keyExtractor={(item) => item.id}
            contentContainerStyle={{ columnGap: SIZES.medium }}
            horizontal
    />
)}



</View>

</View>
    );
};

export default Popularservices;