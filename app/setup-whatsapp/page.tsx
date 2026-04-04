"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, QrCode, RefreshCw } from "lucide-react";
import { authService } from "@/features/auth/application/auth.service";
import { companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";

function toSafeInstanceName(base: string): string {
	const normalized = base
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

	if (normalized.length >= 3) {
		return normalized;
	}

	return "empresa-chatbot";
}

function toQrSrc(value: string | null): string | null {
	if (!value) return null;
	if (value.startsWith("data:image")) return value;
	if (value.startsWith("http://") || value.startsWith("https://")) return value;
	if (/^[A-Za-z0-9+/=\n\r]+$/.test(value)) {
		return `data:image/png;base64,${value.replace(/\s+/g, "")}`;
	}
	return null;
}

export default function SetupWhatsappPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [company, setCompany] = useState<Company | null>(null);
	const [instanceName, setInstanceName] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [qrValue, setQrValue] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const isConnected = status?.toLowerCase() === "connected";
	const qrSrc = useMemo(() => toQrSrc(qrValue), [qrValue]);

	async function refreshStatus(companyId: string, silent = false) {
		if (!silent) {
			setError(null);
			setSuccess(null);
		}

		try {
			const data = await companiesApi.getStatus(companyId);
			setInstanceName(data.instance_name);
			setStatus(data.state);
			if (!silent) {
				setSuccess("Estado actualizado.");
			}
		} catch {
			setStatus(null);
			if (!silent) {
				setError("Aún no hay una instancia activa. Crea una y escanea el QR.");
			}
		}
	}

	async function loadQr(companyId: string) {
		setBusy(true);
		setError(null);
		setSuccess(null);
		try {
			const data = await companiesApi.getQRCode(companyId);
			setInstanceName(data.instance_name);
			setQrValue(data.qrcode);
			setSuccess("QR cargado correctamente.");
		} catch (value) {
			setError(value instanceof Error ? value.message : "No se pudo obtener el QR.");
		} finally {
			setBusy(false);
		}
	}

	async function createInstance() {
		if (!company) return;

		setBusy(true);
		setError(null);
		setSuccess(null);

		try {
			const preferredName = toSafeInstanceName(
				company.whatsapp_instance_name || company.slug || company.name,
			);

			if ((company.whatsapp_instance_name || "").trim() !== preferredName) {
				const updated = await companiesApi.update(company.id, {
					whatsapp_instance_name: preferredName,
				});
				setCompany(updated);
			}

			const created = await companiesApi.createInstance(company.id);
			setInstanceName(created.instance_name);

			await refreshStatus(company.id, true);
			await loadQr(company.id);
			setSuccess("Instancia creada. Escanea el QR para conectar WhatsApp.");
		} catch (value) {
			setError(value instanceof Error ? value.message : "No se pudo crear la instancia.");
		} finally {
			setBusy(false);
		}
	}

	useEffect(() => {
		let mounted = true;

		async function bootstrap() {
			const {
				data: { session },
			} = await authService.getSession();

			if (!session) {
				router.replace("/login");
				return;
			}

			try {
				const data = await companiesApi.bootstrap();
				if (!mounted) return;

				if (data.is_admin) {
					router.replace("/dashboard/admin/companies");
					return;
				}

				if (!data.company) {
					router.replace("/onboarding");
					return;
				}

				const companyIdFromQuery = searchParams.get("companyId");
				if (companyIdFromQuery && data.company.id !== companyIdFromQuery) {
					setError("No tienes acceso a la empresa solicitada.");
					setLoading(false);
					return;
				}

				setCompany(data.company);
				setInstanceName(data.company.whatsapp_instance_name);
				await refreshStatus(data.company.id, true);
			} catch {
				router.replace("/login");
				return;
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		void bootstrap();

		return () => {
			mounted = false;
		};
	}, [router, searchParams]);

	useEffect(() => {
		if (!company || isConnected) return;

		const timer = window.setInterval(() => {
			void refreshStatus(company.id, true);
		}, 8000);

		return () => {
			window.clearInterval(timer);
		};
	}, [company, isConnected]);

	if (loading) {
		return (
			<main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
				<div className="text-sm text-neutral-600">Cargando configuración...</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
			<div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-sm p-8 space-y-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
						Paso obligatorio
					</p>
					<h1 className="text-2xl font-bold text-neutral-950 mt-2">
						Conecta tu instancia de WhatsApp
					</h1>
					<p className="text-sm text-neutral-500 mt-1">
						Debes tener la instancia conectada para habilitar el dashboard.
					</p>
				</div>

				<div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50">
					<p className="text-xs text-neutral-500 uppercase tracking-wide">Empresa</p>
					<p className="text-sm text-neutral-900 mt-1">{company?.name}</p>
					<p className="text-xs text-neutral-500 mt-2">
						Instancia: {instanceName || "Sin nombre asignado"}
					</p>
					<p className="text-xs mt-1 inline-flex items-center gap-1.5">
						<CheckCircle2
							className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-600" : "text-neutral-400"}`}
						/>
						<span className={isConnected ? "text-emerald-700" : "text-neutral-600"}>
							Estado: {status || "pendiente"}
						</span>
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={createInstance}
						disabled={busy || isConnected || !company}
						className="rounded-xl bg-neutral-950 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
					>
						{busy ? "Procesando..." : "Crear instancia"}
					</button>
					<button
						type="button"
						onClick={() => company && void refreshStatus(company.id)}
						disabled={busy || !company}
						className="rounded-xl border border-neutral-300 text-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60 inline-flex items-center gap-2"
					>
						<RefreshCw className="w-4 h-4" />
						Revisar estado
					</button>
					<button
						type="button"
						onClick={() => company && void loadQr(company.id)}
						disabled={busy || !company}
						className="rounded-xl border border-neutral-300 text-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition disabled:opacity-60 inline-flex items-center gap-2"
					>
						<QrCode className="w-4 h-4" />
						Obtener QR
					</button>
				</div>

				<div className="border border-neutral-200 rounded-2xl p-4 min-h-[260px] bg-white flex items-center justify-center">
					{busy ? (
						<div className="text-sm text-neutral-500 inline-flex items-center gap-2">
							<Loader2 className="w-4 h-4 animate-spin" />
							Cargando...
						</div>
					) : qrSrc ? (
						<Image
							src={qrSrc}
							alt="QR de conexión"
							width={240}
							height={240}
							className="w-auto max-h-60"
							unoptimized
						/>
					) : qrValue ? (
						<p className="text-xs text-neutral-600 break-all text-center">{qrValue}</p>
					) : (
						<p className="text-sm text-neutral-500 text-center">
							Aún no hay QR disponible. Crea la instancia y solicita el QR.
						</p>
					)}
				</div>

				{success && (
					<div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
						{success}
					</div>
				)}

				{error && (
					<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
						{error}
					</div>
				)}

				<button
					type="button"
					disabled={!isConnected}
					onClick={() => router.replace("/dashboard")}
					className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-medium hover:bg-emerald-500 transition disabled:opacity-50"
				>
					Continuar al dashboard
				</button>
			</div>
		</main>
	);
}
