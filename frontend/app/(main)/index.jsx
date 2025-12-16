// app/(main)/index.jsx
import { Redirect } from "expo-router";

export default function MainIndex() {
  return <Redirect href="/(main)/(tabs)/freeStuff" />;
}


