import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  durationDays: number;
};

export function CheckoutDialog({ product }: { product: Product }) {
  return (
    <Button asChild className="w-full" size="lg">
      <Link href={`/comprar?productSlug=${product.slug}`}>
        <ShoppingCart className="h-4 w-4" />
        Comprar agora
      </Link>
    </Button>
  );
}
