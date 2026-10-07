import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  applyAsLawyer,
  approveLawyer,
  getAllLawyers,
  getAllPublicLawyers,
  getPublicLawyerProfile,
  updateLawyerProfile,
  verifyLawyerAccount,
} from "@/api";
import { justiceService } from "@/services/justice.service";
import type {
  LawyerParams,
  PublicLawyerParams,
} from "@/types/lawyer.type";
import type { VerifyAccountPayload } from "@/types/auth.type";

export function useApplyAsLawyer() {
  return useMutation({
    mutationFn: applyAsLawyer,
  });
}

export function useVerifyLawyerAccount() {
  return useMutation({
    mutationFn: (payload: VerifyAccountPayload) =>
      verifyLawyerAccount(payload),
  });
}

export function useGetAllLawyers(params: LawyerParams) {
  return useQuery({
    queryKey: ["lawyers", params],
    queryFn: () => getAllLawyers(params),
  });
}

export function useSuspenseGetAllLawyers(params: LawyerParams) {
  return useSuspenseQuery({
    queryKey: ["lawyers", params],
    queryFn: () => getAllLawyers(params),
  });
}

export function useGetPublicLawyers(
  params: PublicLawyerParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["public-lawyers", params],
    queryFn: () => getAllPublicLawyers(params),
    enabled,
  });
}

export function useSuspenseGetPublicLawyers(params: PublicLawyerParams) {
  return useSuspenseQuery({
    queryKey: ["public-lawyers", params],
    queryFn: () => getAllPublicLawyers(params),
  });
}

export function usePublicLawyerProfile(lawyerId: string) {
  return useQuery({
    queryKey: ["public-lawyer", lawyerId],
    queryFn: () => getPublicLawyerProfile(lawyerId),
    enabled: Boolean(lawyerId),
  });
}

export function useSpecializations() {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: () => justiceService.specializations(),
  });
}

export function useApproveLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveLawyer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["lawyers"] }),
  });
}

export function useUpdateLawyerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLawyerProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
}
