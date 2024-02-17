
import {Text,View,TouchableOpacity,Image} from 'react-native';
import { FlatList } from 'react-native';
import tw from "twrnc";



const data =[
{
id:"977",
title:"Home Services",
imageUrl:require ('../assets/house.png'),
screen:"Serviceproviders",

},
{
id:"976",
title:"Electronic Services",
imageUrl:require('../assets/fix.png'),
screen:"Serviceproviders",
},

];

export default function Navoptions (){

    return (
<FlatList
data={data}
horizontal
keyExtractor={(item) => item.id}
renderItem={({item})=>(

    <TouchableOpacity style={tw `p-2 pl-6 pb-8 pt-4 bg-gray-200 m-2 w-40`}>
       <View>
<Image
style={{width:120,height:120, resizeMode:"contain"}}
source={item.imageUrl}



/>
<Text>{item.title}</Text>
       </View>
    </TouchableOpacity>
)}



/>


    );
};


