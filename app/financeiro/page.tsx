"use client";

import { AppLayout } from "@/ui/layout/AppLayout";

import { FinanceiroDashboard } from "@/modules/vendas/components/financeiro/FinanceiroDashboard";

export default function FinanceiroPage() {
  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto">
        <FinanceiroDashboard />
      </div>
    </AppLayout>
  );
}