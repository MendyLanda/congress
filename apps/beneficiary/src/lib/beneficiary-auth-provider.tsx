import { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { RouterOutputs } from "@congress/api/types";

import { useTRPC } from "./trpc";

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

export function BeneficiaryAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch session
  const {
    data: session,
    isLoading,
    refetch: refetchSession,
  } = useQuery(trpc.beneficiaryAuth.getSession.queryOptions(undefined));

  const isAuthenticated = !!session;

  // Sign out mutation
  const logoutMutation = useMutation(
    trpc.beneficiaryAuth.logout.mutationOptions({
      onSuccess: async () => {
        // Invalidate session query
        await queryClient.invalidateQueries(
          trpc.beneficiaryAuth.getSession.pathFilter(),
        );
        // Navigate to home
        await navigate({ href: "/", replace: true });
      },
    }),
  );

  const signOut = useCallback(async () => {
    await logoutMutation.mutateAsync();
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

