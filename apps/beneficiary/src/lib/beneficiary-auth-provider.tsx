import { createContext, useCallback, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";

import type { RouterOutputs } from "@congress/api";

type BeneficiarySession = RouterOutputs["beneficiaryAuth"]["getSession"];

interface BeneficiaryAuthContextValue {
  session: BeneficiarySession | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refetchSession: () => Promise<void>;
}

const BeneficiaryAuthContext = createContext<
  BeneficiaryAuthContextValue | undefined
>(undefined);

const BENEFICIARY_AUTH_COOKIE_NAME = "congress_bat"; // congress beneficiary auth token

/**
 * Check if the auth cookie exists client-side
 */
function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((cookie) =>
      cookie.trim().startsWith(`${BENEFICIARY_AUTH_COOKIE_NAME}=`),
    );
}

export function BeneficiaryAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orpc } = useRouteContext({ from: "__root__" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Only fetch session if cookie exists - skip API call if no cookie
  const cookieExists = hasAuthCookie();
  const {
    data: session,
    isLoading,
    refetch: refetchSession,
  } = useQuery({
    ...orpc.beneficiaryAuth.getSession.queryOptions(),
    enabled: cookieExists, // Only run query if cookie exists
    retry: false, // Don't retry if there's no session
    retryOnMount: false, // Don't retry on mount if there's no session
    staleTime: 0, // Always check for fresh session
  });

  const isAuthenticated = !!session;

  // Sign out mutation
  const logoutMutation = useMutation(
    orpc.beneficiaryAuth.logout.mutationOptions({
      onSuccess: async () => {
        // Invalidate session query
        await queryClient.invalidateQueries({
          queryKey: [["beneficiaryAuth", "getSession"]],
        });
        // Navigate to home
        await navigate({ href: "/", replace: true });
      },
    }),
  );

  const signOut = useCallback(async () => {
    await logoutMutation.mutateAsync(undefined);
  }, [logoutMutation]);

  const refetchSessionCallback = useCallback(async () => {
    await refetchSession();
  }, [refetchSession]);

  return (
    <BeneficiaryAuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated,
        signOut,
        refetchSession: refetchSessionCallback,
      }}
    >
      {children}
    </BeneficiaryAuthContext.Provider>
  );
}

export function useBeneficiaryAuth() {
  const context = useContext(BeneficiaryAuthContext);
  if (context === undefined) {
    throw new Error(
      "useBeneficiaryAuth must be used within a BeneficiaryAuthProvider",
    );
  }
  return context;
}
