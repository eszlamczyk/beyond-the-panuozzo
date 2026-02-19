import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { foodsQueryOptions } from '@/api/foods';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format-price';

export const Route = createFileRoute('/foods/')({
  component: FoodsPage,
});

function FoodsPage() {
  const { data: foods, isLoading, error } = useQuery(foodsQueryOptions);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Food Catalogue</h2>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load foods.
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : foods?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No foods found.
                </TableCell>
              </TableRow>
            ) : (
              foods?.map((food) => (
                <TableRow key={food.id}>
                  <TableCell className="font-medium">{food.name}</TableCell>
                  <TableCell>
                    {food.typeName && (
                      <Badge variant="secondary">{food.typeName}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(food.price)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
