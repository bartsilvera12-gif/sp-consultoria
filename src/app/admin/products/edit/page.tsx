"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Loading, EmptyState, Btn } from "@/components/admin/ui";
import Link from "next/link";

function EditInner() {
  const id = useSearchParams().get("id");
  if (!id) {
    return (
      <EmptyState icon="box" title="Producto no encontrado" message="Falta el identificador del producto."
        action={<Link href="/admin/products"><Btn>Volver a productos</Btn></Link>} />
    );
  }
  return <ProductForm productId={id} />;
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditInner />
    </Suspense>
  );
}
