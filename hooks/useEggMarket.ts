import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";

export function useEggMarket(filters?: { eggType?: string; governorate?: string }) {
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  const adsQuery = useQuery(
    trpc.poultry.eggMarket.list.queryOptions({
      eggType: filters?.eggType,
      governorate: filters?.governorate,
    })
  );

  const createAdMutation = useMutation(
    trpc.poultry.eggMarket.create.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم إرسال الإعلان وهو في انتظار الموافقة" });
        queryClient.invalidateQueries(trpc.poultry.eggMarket.list.queryKey());
        queryClient.invalidateQueries(trpc.poultry.eggMarket.getMyAds.queryKey());
      },
      onError: (error: any) => {
        showToast({ type: "error", message: error.message || "حدث خطأ" });
      },
    })
  );

  const deleteMyAdMutation = useMutation(
    trpc.poultry.eggMarket.deleteMyAd.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.eggMarket.list.queryKey());
      },
    })
  );

  const adminDeleteMutation = useMutation(
    trpc.poultry.eggMarket.adminDelete.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم حذف الإعلان" });
        queryClient.invalidateQueries(trpc.poultry.eggMarket.list.queryKey());
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
