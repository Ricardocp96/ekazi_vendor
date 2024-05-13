import React, { useState } from "react";
import DropDownPicker from 'react-native-dropdown-picker'
import axios from 'axios';
import Constants from 'expo-constants';
import { useHeaderHeight } from '@react-navigation/elements'
import { Logs } from 'expo'
import {
    ScrollView,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Image,
    StyleSheet,
  } from "react-native";

  import {
    Layout,
    Text,
    TextInput,
    Button,
    useTheme,
    themeColor,
    Picker,
    Section,
    SectionContent,
  } from "react-native-rapi-ui";

  
  export default function ({ navigation }) {
    const { isDarkmode, setTheme } = useTheme();
    const [username, setusername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [pickerValue, setPickerValue] = React.useState(null);
    const height = useHeaderHeight();
    const items = [
        { label: 'Provider', value: 'STD' },
        { label: 'Client', value: 'TEE' },
      
       
    ];
   
    async function  auth_api  (){ 
      try{
      setLoading(true);
     const sender = await axios.post('http://13.51.201.202:3000/auth/login', {
        username: username,
        password:password

       });
       
    // Check if the response indicates successful authentication
    //TODO -- add a diistinguuishable factor to distinguish network error vs credential error
    if (sender.data) {
      console.log(sender.data)
      navigation.replace("Home", {
          screen: "Home",
          params: { username }
      })
  } else {
      // Handle unsuccessful authentication
      console.log(sender.data)
      setLoading(false);
      alert("Incorrect credentials");
  }
} catch (error) {
  // Handle network errors or server errors
  setLoading(false);
  alert("Network error or server error occurred");
  console.log(error);
}
};
      
      
    
  return (
    <KeyboardAvoidingView 
    keyboardVerticalOffset={height + 47}
    style={{ flex: 1 }}
  >
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
            }}
          >
            
            <Image
              resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../assets/ekazi.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
            }}
          >
            <Text
              fontWeight="bold"
              style={{
                alignSelf: "center",
                padding: 30,
              }}
              size="h3"
            >
              ekazi
            </Text>
            <Section style={{ marginHorizontal: -18, marginTop: 20 }}>
            <SectionContent>
                <View>
                    <Text style={{ marginBottom: 10 }}>
</Text>
                    
                </View>
            </SectionContent>
        </Section>
          
            <Text>User username</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="User username"
              value={username}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => setusername(text)}
            />

            <Text style={{ marginTop: 15 }}>Password</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter Password"
              value={password}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
            <Button
              text={loading ? "Loading" : "Log In"}
              onPress={() => {
                 //auth from server side 
                
                auth_api();
                // login directly to the home page 
                //navigation.replace("Home")

            

               


              }}
              style={{
                marginTop: 20,
              }}
              disabled={loading}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                justifyContent: "center",
              }}
            >
              <Text size="md">Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => {
                

                  navigation.navigate("Register");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ForgetPassword");
                }}
              >
                <Text size="md" fontWeight="bold">
                Forgot Password
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  isDarkmode ? setTheme("light") : setTheme("dark");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  {isDarkmode ? "☀️ Light" : "🌑 Dark"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
