import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FeaturesScreen from './screens/FeaturesScreen';
import PerformanceScreen from './screens/PerformanceScreen';

const Tab = createBottomTabNavigator();
const FeaturesStackNav = createNativeStackNavigator();

// Wrap the Features screen in a native stack so it gets a real native header,
// where FeaturesScreen installs its "compare with Text" toggle via headerRight.
function FeaturesStack() {
  return (
    <FeaturesStackNav.Navigator>
      <FeaturesStackNav.Screen name="PlainText" component={FeaturesScreen} />
    </FeaturesStackNav.Navigator>
  );
}

const featuresIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="text" color={color} size={size} />
);

const performanceIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="speedometer" color={color} size={size} />
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen
            name="Features"
            component={FeaturesStack}
            options={{ tabBarIcon: featuresIcon }}
          />
          <Tab.Screen
            name="Performance"
            component={PerformanceScreen}
            options={{ tabBarIcon: performanceIcon }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
