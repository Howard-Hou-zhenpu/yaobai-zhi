import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDecisions,
  getDecisionById,
  addDecision,
  updateDecision,
  deleteDecision,
} from '../lib/storage';

export function useDecisions() {
  return useQuery({
    queryKey: ['decisions'],
    queryFn: getDecisions,
  });
}

export function useDecision(id) {
  return useQuery({
    queryKey: ['decisions', id],
    queryFn: () => getDecisionById(id),
    enabled: !!id,
  });
}

export function useAddDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDecision,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['decisions'] }),
  });
}

export function useUpdateDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateDecision(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['decisions'] }),
  });
}

export function useDeleteDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDecision,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['decisions'] }),
  });
}
