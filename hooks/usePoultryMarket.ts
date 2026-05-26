import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";

export function usePoultryMarket(filters?: { poultryType?: string; governorate?: string }) {
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  const adsQuery = useQuery(
    trpc.poultry.market.list.queryOptions({
      poultryType: filters?.poultryType,
      governorate: filters?.governorate,
    })
  );

  const createAdMutation = useMutation(
    trpc.poultry.market.create.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم إرسال الإعلان وهو في انتظار الموافقة" });
        queryClient.invalidateQueries(trpc.poultry.market.list.queryKey());
        queryClient.invalidateQueries(trpc.poultry.market.getMyAds.queryKey());
      },
      onError: (error: any) => {
        showToast({ type: "error", message: error.message || "حدث خطأ أثناء إنشاء الإعلان" });
      },
    })
  );

  const deleteMyAdMutation = useMutation(
    trpc.poultry.market.deleteMyAd.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.market.list.queryKey());
        queryClient.invalidateQueries(trpc.poultry.market.getMyAds.queryKey());
      },
    })
  );

  const adminDeleteMutation = useMutation(
    trpc.poultry.market.adminDelete.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.market.list.queryKey());
      },
    })
  );

  return {
    ads: adsQuery.data?.ads || [],
    isLoading: adsQuery.isLoading,
    refetch: adsQuery.refetch,
    createAd: createAdMutation.mutate,
    isCreating: createAdMutation.isPending,
    deleteMyAd: deleteMyAdMutation.mutate,
    adminDelete: adminDeleteMutation.mutate,
  };
}

export function useMyPoultryAds() {
  return useQuery(trpc.poultry.market.getMyAds.queryOptions());
}
