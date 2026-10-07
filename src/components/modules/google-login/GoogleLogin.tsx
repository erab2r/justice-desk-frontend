"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMe } from "@/api";
import { toast } from "@/components/ui/toast";
import { useGoogleOAuth } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import { authenticatedPathForUser } from "@/routes/dashboard.routes";


export default function GoogleLoginComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: googleLogin } = useGoogleOAuth();

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.add({
        title: "Google OAuth Failed",
        description: "Something went wrong. Please try again",
        type: "error",
      });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: async () => {
          queryClient.removeQueries({ queryKey: ["user"] });
          try {
            const user = await queryClient.fetchQuery({
              queryKey: ["user"],
              queryFn: getMe,
              staleTime: 0,
            });
            toast.add({
              title: "Logged in Successfully",
              description: "Welcome back",
              type: "success",
            });
            router.replace(authenticatedPathForUser(user));
          } catch (error) {
            toast.add({
              title: "Unable to verify your account",
              description: getApiErrorMessage(error),
              type: "error",
            });
          }
        },
        onError: (err) => {
          toast.add({
            title: "Google OAuth Failed",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      },
    );
  };

  const handleGoogleError = () => {
    toast.add({
      title: "Google OAuth Failed",
      description: "Something went wrong. Please try again",
      type: "error",
    });
  };

  return (
    <GoogleLogin
      theme="outline"
      shape="pill"
      text="continue_with"
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
    />
  );
}
