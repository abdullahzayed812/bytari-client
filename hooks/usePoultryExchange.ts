import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";

export function usePoultryExchange(date?: string) {
  return useQuery(trpc.poultry.exchange.getPrices.queryOptions({ date }));
}

export function useEggExchange(date?: string) {
  return useQuery(trpc.poultry.eggExchange.getPrices.queryOptions({ date }));
}

export function useSavePoultryExchange() {
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  return useMutation(
    trpc.poultry.exchange.savePrices.mutationOptions({
      onSuccess: (data) => {
        showToast({ type: "success", message: data.message });
        queryClient.invalidateQueries(trpc.poultry.exchange.getPrices.queryKey());
      },
      onError: (error: any) => {
        showToast({ type: "error", message: error.message || "حدث خطأ أثناء الحفظ" });
      },
    })
  );
}

export function useSaveEggExchange() {
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  return useMutation(
    trpc.poultry.eggExchange.savePrices.mutationOptions({
      onSuccess: (data) => {
        showToast({ type: "success", message: data.message });
        queryClient.invalidateQueries(trpc.poultry.eggExchange.getPrices.queryKey());
      },
      onError: (error: any) => {
        showToast({ type: "error", message: error.message || "حدث خطأ أثناء الحفظ" });
      },
    })
  );
}
