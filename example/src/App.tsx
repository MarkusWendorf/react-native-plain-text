import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import UsageScreen from './screens/UsageScreen';
import PerformanceScreen from './screens/PerformanceScreen';

const Tab = createBottomTabNavigator();

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
            name="Usage"
            component={UsageScreen}
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
