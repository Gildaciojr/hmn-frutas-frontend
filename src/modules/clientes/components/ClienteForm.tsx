"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useClientes } from "../hooks/useClientes";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { ESTADOS_UF } from "@/constants/estados";

// ================= TYPES =================
interface Props {
  ////////////////////////////////////////////////////////////
  // CALLBACK
  ////////////////////////////////////////////////////////////

  onSuccess?: () => void;

  ////////////////////////////////////////////////////////////
  // MODO EDIÇÃO
  ////////////////////////////////////////////////////////////

  initialData?: {
    id: string;

    tipoCliente: "PESSOA_FISICA" | "PESSOA_JURIDICA";

    nome: string;

    cpf?: string;

    cnpj?: string;

    razaoSocial?: string;

    inscricaoEstadual?: string;

    nomeFantasia?: string;

    proprietarioNome?: string;

    telefone: string;

    email?: string;

    endereco?: string;

    bairro?: string;

    cep?: string;

    cidade?: string;

    estado?: string;

    observacoes?: string;

    descontoPercentual: number;
  } | null;

  ////////////////////////////////////////////////////////////
  // MODO VISUAL
  ////////////////////////////////////////////////////////////

  embedded?: boolean;

  modalMode?: boolean;
}

// ================= HELPERS =================

// 🔥 TELEFONE
function formatTelefone(value: string) {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);

  if (cleaned.length <= 10) {
    return cleaned.replace(
      /(\d{2})(\d{4})(\d{0,4})/,
      (_, a, b, c) => `(${a}) ${b}${c ? "-" + c : ""}`,
    );
  }

  return cleaned.replace(
    /(\d{2})(\d{5})(\d{0,4})/,
    (_, a, b, c) => `(${a}) ${b}${c ? "-" + c : ""}`,
  );
}

// 🔥 CPF / CNPJ DINÂMICO
function formatDocumento(value: string) {
  const cleaned = value.replace(/\D/g, "").slice(0, 14);

  if (cleaned.length <= 11) {
    return cleaned.replace(
      /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
      (_, a, b, c, d) => `${a}.${b}.${c}${d ? "-" + d : ""}`,
    );
  }

  return cleaned.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
    (_, a, b, c, d, e) => `${a}.${b}.${c}/${d}${e ? "-" + e : ""}`,
  );
}

// ================= COMPONENT =================
export function ClienteForm({
  onSuccess,
  initialData,
  embedded = false,
  modalMode = false,
}: Props) {
  const { createCliente, updateCliente, creating, updating } = useClientes();

  // ================= STATES =================
  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [tipoCliente, setTipoCliente] = useState<
    "PESSOA_FISICA" | "PESSOA_JURIDICA"
  >(initialData?.tipoCliente ?? "PESSOA_FISICA");

  const [cpf, setCpf] = useState(initialData?.cpf ?? "");

  const [cnpj, setCnpj] = useState(initialData?.cnpj ?? "");

  const [razaoSocial, setRazaoSocial] = useState(
    initialData?.razaoSocial ?? "",
  );

  const [inscricaoEstadual, setInscricaoEstadual] = useState(
    initialData?.inscricaoEstadual ?? "",
  );

  const [nomeFantasia, setNomeFantasia] = useState(
    initialData?.nomeFantasia ?? "",
  );

  const [proprietarioNome, setProprietarioNome] = useState(
    initialData?.proprietarioNome ?? "",
  );

  const [cep, setCep] = useState(initialData?.cep ?? "");

  const [cidade, setCidade] = useState(initialData?.cidade ?? "");

  const [estado, setEstado] = useState(initialData?.estado ?? "");

  const [telefone, setTelefone] = useState(initialData?.telefone ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [endereco, setEndereco] = useState(initialData?.endereco ?? "");
  const [bairro, setBairro] = useState(initialData?.bairro ?? "");
  const [observacoes, setObservacoes] = useState(
    initialData?.observacoes ?? "",
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditMode = !!initialData;

  // ================= SUBMIT =================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (!nome.trim()) {
      setError(
        tipoCliente === "PESSOA_JURIDICA"
          ? "Informe o nome da empresa"
          : "Informe o nome do cliente",
      );

      return;
    }

    if (!telefone.trim()) {
      setError("Informe o telefone");

      return;
    }

    if (tipoCliente === "PESSOA_FISICA" && !cpf.trim()) {
      setError("Informe o CPF");

      return;
    }

    if (tipoCliente === "PESSOA_JURIDICA" && !cnpj.trim()) {
      setError("Informe o CNPJ");

      return;
    }

    if (email && !email.includes("@")) {
      setError("Informe um email válido");

      return;
    }

    const payload = {
      tipoCliente,

      nome: nome.trim(),

      cpf: tipoCliente === "PESSOA_FISICA" ? cpf.replace(/\D/g, "") : undefined,

      cnpj:
        tipoCliente === "PESSOA_JURIDICA" ? cnpj.replace(/\D/g, "") : undefined,

      razaoSocial:
        tipoCliente === "PESSOA_JURIDICA"
          ? razaoSocial.trim() || undefined
          : undefined,

      nomeFantasia:
        tipoCliente === "PESSOA_JURIDICA"
          ? nomeFantasia.trim() || undefined
          : undefined,

      inscricaoEstadual:
        tipoCliente === "PESSOA_JURIDICA"
          ? inscricaoEstadual.trim() || undefined
          : undefined,

      proprietarioNome:
        tipoCliente === "PESSOA_JURIDICA"
          ? proprietarioNome.trim() || undefined
          : undefined,

      telefone: telefone.replace(/\D/g, "") || undefined,

      email: email.trim() || undefined,

      endereco: endereco.trim() || undefined,

      bairro: bairro.trim() || undefined,

      cep: cep.trim() || undefined,

      cidade: cidade.trim() || undefined,

      estado: estado.trim().toUpperCase() || undefined,

      observacoes: observacoes.trim() || undefined,
    };

    try {
      if (isEditMode && initialData?.id) {
        await updateCliente({
          id: initialData.id,
          data: payload,
        });
      } else {
        await createCliente(payload);

        ////////////////////////////////////////////////////
        // RESET SOMENTE PARA CREATE
        ////////////////////////////////////////////////////

        setTipoCliente("PESSOA_FISICA");

        setNome("");

        setCpf("");

        setCnpj("");

        setRazaoSocial("");

        setInscricaoEstadual("");

        setNomeFantasia("");

        setProprietarioNome("");

        setTelefone("");

        setEmail("");

        setEndereco("");

        setBairro("");

        setCep("");

        setCidade("");

        setEstado("");

        setObservacoes("");
      }

      setSuccess(true);

      onSuccess?.();
    } catch (err) {
      console.error(err);

      setError(
        isEditMode ? "Erro ao atualizar cliente" : "Erro ao criar cliente",
      );
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
      w-full

      space-y-6

      ${
        modalMode
          ? `
            max-h-[85vh]
            overflow-y-auto
            pr-1
          `
          : ""
      }

      ${
        embedded
          ? `
            rounded-2xl
          `
          : ""
      }
    `}
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[color:var(--border-soft)]">
        <div className="space-y-1">
          <h2 className="text-[18px] font-semibold tracking-tight text-[color:var(--foreground)]">
            {isEditMode ? "Editar cliente" : "Novo cliente"}
          </h2>

          <p className="text-[12px] text-[color:var(--muted)] leading-relaxed">
            {isEditMode
              ? "Atualize as informações comerciais e de contato do cliente"
              : "Cadastro completo para operações comerciais e financeiras"}
          </p>
        </div>

        {isEditMode && (
          <span className="text-[10px] px-2 py-[4px] rounded-md bg-emerald-100 text-emerald-600 font-medium">
            Editando
          </span>
        )}
      </div>

      {/* ================= CONTEÚDO ================= */}
      <div
        className="
    grid

    grid-cols-1
    xl:grid-cols-[1.15fr_0.85fr]

    gap-5
  "
      >
        {/* ================= IDENTIFICAÇÃO ================= */}
        <div
          className="
    relative
    overflow-hidden

    rounded-[24px]

    border
    border-[color:var(--border-soft)]

    bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))]

    p-5

    shadow-[0_10px_30px_rgba(15,23,42,0.04)]

    space-y-4
  "
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[color:var(--foreground)]">
              Identificação
            </h3>

            <span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted-soft)]">
              Dados principais
            </span>
          </div>

          <div className="col-span-2">
            <label className="label-base">Tipo de cliente</label>

            <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={tipoCliente === "PESSOA_FISICA"}
                  onChange={() => setTipoCliente("PESSOA_FISICA")}
                />
                Pessoa Física
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={tipoCliente === "PESSOA_JURIDICA"}
                  onChange={() => setTipoCliente("PESSOA_JURIDICA")}
                />
                Pessoa Jurídica
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NOME */}
            <div className="col-span-2">
              <label className="label-base">
                {tipoCliente === "PESSOA_JURIDICA"
                  ? "Empresa"
                  : "Nome completo"}
              </label>

              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="input-base"
              />
            </div>

            {/* PESSOA FÍSICA */}
            {tipoCliente === "PESSOA_FISICA" && (
              <div>
                <label className="label-base">CPF</label>

                <input
                  value={cpf}
                  onChange={(e) => setCpf(formatDocumento(e.target.value))}
                  placeholder="000.000.000-00"
                  className="input-base"
                />
              </div>
            )}
          </div>

          {/* PESSOA JURÍDICA */}
          {tipoCliente === "PESSOA_JURIDICA" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-base">Nome Proprietário</label>

                <input
                  value={proprietarioNome}
                  onChange={(e) => setProprietarioNome(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="label-base">CNPJ</label>

                <input
                  value={cnpj}
                  onChange={(e) => setCnpj(formatDocumento(e.target.value))}
                  className="input-base"
                />
              </div>

              <div>
                <label className="label-base">Inscrição Estadual</label>

                <input
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="label-base">Nome Fantasia</label>

                <input
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="input-base"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= CONTATO ================= */}
        <div
          className="
    relative
    overflow-visible

    rounded-[24px]

    border
    border-[color:var(--border-soft)]

    bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))]

    p-5

    shadow-[0_10px_30px_rgba(15,23,42,0.04)]

    space-y-4
  "
        >
          <h3 className="text-[13px] font-semibold text-[color:var(--foreground)]">
            Contato
          </h3>

          <div className="grid grid-cols-12 gap-3">
            {/* TELEFONE */}
            <div className="col-span-12 md:col-span-6">
              <label className="label-base">Telefone</label>

              <input
                value={telefone}
                onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                placeholder="(62) 99999-9999"
                inputMode="numeric"
                autoComplete="tel"
                className="input-base"
              />
            </div>

            {/* EMAIL */}
            <div className="col-span-12 md:col-span-6">
              <label className="label-base">Email</label>

              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="input-base"
              />
            </div>

            {/* ENDEREÇO */}
            <div className="col-span-12 md:col-span-6">
              <label className="label-base">Endereço</label>

              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, cidade..."
                className="input-base"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="label-base">Bairro</label>

              <input
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Setor / Bairro"
                className="input-base"
              />
            </div>

            {/* CEP */}
            <div className="col-span-12 md:col-span-4">
              <label className="label-base">CEP</label>

              <input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="input-base"
              />
            </div>

            {/* CIDADE */}
            <div className="col-span-12 md:col-span-5">
              <label className="label-base">Cidade</label>

              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="input-base"
              />
            </div>

            {/* ESTADO */}
            <div className="relative z-50 col-span-12 md:col-span-3">
              <label className="label-base">Estado</label>

              <Autocomplete
                value={estado}
                onChange={(value) => setEstado(value.toUpperCase())}
                options={[...ESTADOS_UF]}
                className="input-base"
              />
            </div>
          </div>
        </div>

        {/* ================= OBSERVAÇÕES ================= */}

        <div
          className="
    xl:col-span-2

    relative
    overflow-hidden

    rounded-[24px]

    border
    border-[color:var(--border-soft)]

    bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))]

    p-3

    shadow-[0_10px_30px_rgba(15,23,42,0.04)]
  "
        >
          <div className="space-y-1 mb-2">
            <h3
              className="
        text-[13px]
        font-semibold

        text-[color:var(--foreground)]
      "
            >
              Observações
            </h3>

            <p
              className="
        text-[11px]

        text-[color:var(--muted-soft)]
      "
            >
              Informações adicionais sobre o cliente
            </p>
          </div>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            className="
      w-full

      min-h-[100px]

      rounded-[18px]

      border
      border-[color:var(--border-soft)]

      bg-white/80

      px-4
      py-3

      text-[13px]

      resize-none

      outline-none

      transition-all
      duration-200

      focus:border-indigo-400
      focus:ring-4
      focus:ring-indigo-500/10
    "
          />
        </div>

        {/* ================= FEEDBACK ================= */}
        <div className="space-y-2 pt-4">
          {error && (
            <div
              className="
              alert-error
              animate-in fade-in duration-200

              border border-red-200
              bg-red-50/80

              backdrop-blur-sm
            "
            >
              <div className="space-y-1">
                <p className="font-semibold">Erro ao salvar cliente</p>

                <p className="text-[12px] leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div
              className="
              alert-success
              animate-in fade-in duration-200

              border border-emerald-200
              bg-emerald-50/80

              backdrop-blur-sm
            "
            >
              <div className="space-y-1">
                <p className="font-semibold">
                  {isEditMode ? "Cliente atualizado" : "Cliente criado"}
                </p>

                <p className="text-[12px] leading-relaxed">
                  {isEditMode
                    ? "As informações comerciais e financeiras foram atualizadas com sucesso."
                    : "O cliente já está disponível para operações comerciais e financeiras."}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* ================= ACTION ================= */}
        <div
          className="
    pt-6

    flex

    justify-stretch
    sm:justify-end

    border-t
    border-[color:var(--border-soft)]
  "
        >
          <button
            type="submit"
            disabled={creating || updating}
            className="btn-primary w-full sm:w-auto px-6"
          >
            {creating || updating
              ? "Salvando..."
              : isEditMode
                ? "Salvar alterações"
                : "Criar cliente"}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
