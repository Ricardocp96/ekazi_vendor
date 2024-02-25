import {useState} from 'react';
import {Text,View,TouchableOpacity, FlatList,ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import styles  from './style';
import {COLORS,SIZES} from '../constants'
import Popularservicecard from './Popularservicecard';
import useFetch from '../hooks/useFetch';
const Popularservices = () => {
const router = useRouter();
const { data, isLoading, error } = useFetch("search", {
    query: "React developer",
    num_pages: "1",
  });
  const [selectedJob, setSelectedJob] = useState();

  const handleCardPress = (item) => {
    router.push(`/job-details/${item.job_id}`);
    setSelectedJob(item.job_id);
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
        keyExtractor={(item) => item.job_id}
            contentContainerStyle={{ columnGap: SIZES.medium }}
            horizontal
    />
)}


</View>

</View>
    );
};

export default Popularservices;