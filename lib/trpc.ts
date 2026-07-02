import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../server/trpc/app-router.js";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For Android emulator, use 10.0.2.2
// For physical device, use your computer's IP (192.168.0.128)
// For iOS simulator, use localhost

export const API_URL = __DEV__ ? "http://192.168.0.128:3001" : "https://bytari.vet";

export const queryClient = new QueryClient();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      transformer: superjson,
      async headers() {
        const token = await AsyncStorage.getItem("accessToken");
        return {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        };
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
