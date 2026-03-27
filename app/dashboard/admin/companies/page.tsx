import { Building2, ShoppingCart, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Company, Order } from "@/lib/types";

export default async function AdminGlobalPage() {
  /** * NOTA PARA CONEXIÓN DE DATOS REAL: 
   * Aquí es donde se conectara manualmente con:
   * const companies = await companiesApi.list();
   * const orders = await dashboardApi.orders();
   * * Por ahora, definimos la estructura de datos vacía o mock 
   * para que la UI esté lista para la tarea.
   */
  const companies: Company[] = []; 
  const orders: Order[] = [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start font-sans">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
            Administración de Infraestructura
          </h1>
          <p className="text-neutral-500 text-sm font-medium">
            Control global de instancias y monitoreo de transacciones AURA.
          </p>
        </div>
        <div className="bg-neutral-100 p-2 rounded-lg border border-neutral-200">
          <Shield className="w-5 h-5 text-neutral-400" />
        </div>
      </div>

      {/* Grid de Métricas de Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Empresas Totales</p>
          <p className="text-2xl font-black text-neutral-900">{companies.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Órdenes del Sistema</p>
          <p className="text-2xl font-black text-neutral-900">{orders.length}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Estado API</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-lg font-bold text-white uppercase tracking-tighter">Ready</p>
          </div>
        </div>
      </div>

      {/* Tabla de Gestión de Instancias (Requisito: Companies) */}
      <section className="bg-white rounded-3xl border border-neutral-200/60 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
          <h2 className="font-bold text-neutral-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neutral-400" />
            Directorio de Clientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-400 font-bold uppercase text-[10px] border-b border-neutral-100">
              <tr>
                <th className="px-8 py-4">Empresa / ID</th>
                <th className="px-8 py-4">Plan Actual</th>
                <th className="px-8 py-4">WhatsApp</th>
                <th className="px-8 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-neutral-400 italic">
                    No hay datos de empresas vinculados.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">{c.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono tracking-tighter">ID: {c.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-[9px] font-black uppercase border border-neutral-200">
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-neutral-500">
                      {c.whatsapp_number || "---"}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", c.is_active ? "bg-emerald-500" : "bg-neutral-300")} />
                        <span className="text-xs font-medium text-neutral-600">
                          {c.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monitor de Actividad (Requisito: Orders) */}
      <section className="bg-white rounded-3xl border border-neutral-200/60 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6 text-neutral-800">
          <Activity className="w-5 h-5" />
          <h2 className="font-bold">Monitor de Pedidos Recientes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {orders.length === 0 ? (
            <div className="col-span-full py-6 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-center text-neutral-400 text-xs">
              Esperando flujo de datos de órdenes...
            </div>
          ) : (
            orders.slice(0, 4).map((order) => (
              <div key={order.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-mono text-neutral-400">#{order.id.slice(0, 6)}</span>
                  <span className="text-xs font-black text-emerald-600">${order.total}</span>
                </div>
                <p className="text-sm font-bold text-neutral-800 truncate">{order.customer_name || "Cliente"}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}