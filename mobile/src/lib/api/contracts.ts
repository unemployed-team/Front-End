import { apiClient } from "./client";
import { useAuthStore } from "@/store/auth-store";
import {
  devSessionGetContracts,
  devSessionRegisterContract,
  devSessionUpdateContract,
  devSessionDeleteContract,
  devSessionSimulateContract,
} from "@/lib/dev-session";
import type {
  ContractRequest,
  ContractResponse,
  SimulationResponse,
} from "./types";

function isDevSession() {
  return useAuthStore.getState().isDevSession;
}

export async function getMyContracts() {
  if (isDevSession()) return devSessionGetContracts();
  return apiClient<ContractResponse[]>("/contracts/me");
}

export async function getExpiringContracts() {
  return apiClient<ContractResponse[]>("/contracts/expiring");
}

export async function registerContract(data: ContractRequest) {
  if (isDevSession()) return devSessionRegisterContract(data);
  return apiClient<ContractResponse>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateContract(
  contractId: number,
  data: ContractRequest
) {
  if (isDevSession()) return devSessionUpdateContract(contractId, data);
  return apiClient<ContractResponse>(`/contracts/${contractId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteContract(contractId: number) {
  if (isDevSession()) return devSessionDeleteContract(contractId);
  return apiClient<void>(`/contracts/${contractId}`, {
    method: "DELETE",
  });
}

export async function simulateContract(contractId: number) {
  if (isDevSession()) return devSessionSimulateContract(contractId);
  return apiClient<SimulationResponse>(`/contracts/${contractId}/simulate`, {
    method: "POST",
  });
}
