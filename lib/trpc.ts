import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../server/trpc/app-router.js";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For Android emulator, use 10.0.2.2
// For physical device, use your computer's IP (192.168.0.128)
// For iOS simulator, use localhost

export const API_URL = __DEV__ ? "http://192.168.0.128:3001" : "http://72.60.81.114:3001";

export const queryClient = new QueryClient();

const customFetch: typeof fetch = async (input, init) => {
  const resp = await fetch(input, init);
  const text = await resp.clone().text();
  console.log("RAW RESPONSE TEXT:", text);
  // Return original response to downstream
  return resp;
};

const trpcClient = createTRPCClient<AppRouter>({
  // transformer: superjson,
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      transformer: superjson,
      fetch: customFetch,
      async headers() {
        const token = await AsyncStorage.getItem("accessToken");
        console.log("Fetched token in trpc client-------------------", token);
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
