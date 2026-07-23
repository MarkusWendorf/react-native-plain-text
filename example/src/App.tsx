import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import UsageScreen from './screens/UsageScreen';
import PerformanceScreen from './screens/PerformanceScreen';

const Tab = createBottomTabNavigator();
const UsageStackNav = createNativeStackNavigator();

// Wrap the Usage screen in a native stack so it gets a real native header,
// where UsageScreen installs its "compare with Text" toggle via headerRight.
function UsageStack() {
  return (
    <UsageStackNav.Navigator>
      <UsageStackNav.Screen name="PlainText" component={UsageScreen} />
    </UsageStackNav.Navigator>
  );
}

const usageIcon = ({ color, size }: { color: string; size: number }) => (
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
            component={UsageStack}
            options={{ tabBarIcon: usageIcon }}
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
