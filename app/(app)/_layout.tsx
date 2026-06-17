import { useSession } from "@/ctx";
import { Redirect, Stack, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { user, isLoading } = useSession();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const isAdmin = Boolean(user?.is_admin);

  const isAdminOnlyRoute =
    pathname.startsWith("/kategori") ||
    pathname.startsWith("/donatur") ||
    pathname.startsWith("/penerima") ||
    pathname === "/barang/tambah" ||
    /^\/barang\/[^/]+$/.test(pathname);

  if (!isAdmin && isAdminOnlyRoute) {
    return <Redirect href="/fitur" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#f1f5f9",
        },
      }}
    />
  );
}
