"use client";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { dashboardApi } from "@/lib/api";
import { useCompany } from "@/lib/company-context";
import type { Product } from "@/lib/types";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { AppModal } from "@/components/app-modal";

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product?: Product;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(
    product ?? { is_active: true, price: 0, stock: 0 },
  );

  return (
    <AppModal
      open
      onClose={onClose}
      title={product ? "Edit Product" : "New Product"}
      maxWidthClassName="max-w-md"
    >
      <div className="space-y-3">
        {(["name", "description", "category", "image_url"] as const).map(
          (field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-neutral-500 mb-1 capitalize">
                {field.replace(/_/g, " ")}
              </label>
              <input
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
                value={(form[field] as string) ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [field]: e.target.value }))
                }
              />
            </div>
          ),
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Price
            </label>
            <input
              type="number"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
              value={form.price ?? 0}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: parseFloat(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Stock
            </label>
            <input
              type="number"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-shadow"
              value={form.stock ?? 0}
              onChange={(e) =>
                setForm((p) => ({ ...p, stock: parseInt(e.target.value) }))
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active ?? true}
            onChange={(e) =>
              setForm((p) => ({ ...p, is_active: e.target.checked }))
            }
            className="accent-neutral-950"
          />
          <span className="text-sm text-neutral-700">Active</span>
        </label>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => onSave(form)}
          className="flex-1 bg-neutral-950 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="flex-1 border border-neutral-200 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </AppModal>
  );
}

export default function CatalogPage() {
  const companyId = useCompany();
  const key = `products-${companyId}`;
  const { data: products, isLoading } = useSWR<Product[]>(key, () =>
    dashboardApi.products(companyId),
  );

  const [editing, setEditing] = useState<Product | null | "new">(null);

  async function handleSave(data: Partial<Product>) {
    if (editing === "new") {
      await dashboardApi.createProduct(companyId, data);
    } else if (editing) {
      await dashboardApi.updateProduct(
        companyId,
        (editing as Product).id,
        data,
      );
    }
    setEditing(null);
    await mutate(key);
  }

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product?")) return;
    await dashboardApi.deleteProduct(companyId, productId);
    await mutate(key);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage products your agent can recommend
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 bg-neutral-950 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="w-24 h-4 skeleton" />
              <div className="w-16 h-4 skeleton" />
              <div className="w-12 h-4 skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden animate-fade-in-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                {["Name", "Category", "Price", "Stock", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 font-medium text-neutral-500 text-xs uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(products ?? []).map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-neutral-950">
                    {p.name}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {p.category ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">{p.stock}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.is_active
                          ? "bg-neutral-950 text-white"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-neutral-400 hover:text-neutral-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(products ?? []).length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="text-neutral-500 text-sm">No products yet</p>
              <p className="text-neutral-400 text-xs mt-1">
                Add your first product to get started
              </p>
            </div>
          )}
        </div>
      )}

      {editing && (
        <ProductModal
          product={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
