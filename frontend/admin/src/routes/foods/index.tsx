import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  foodsQueryOptions,
  foodTypesQueryOptions,
  createFood,
  updateFood,
  deleteFood,
} from '@/api/foods';
import { ApiError } from '@/api/client';
import type { Food } from '@/api/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice } from '@/lib/format-price';
import { Pencil, Plus, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/foods/')({
  component: FoodsPage,
});

function FoodsPage() {
  const queryClient = useQueryClient();
  const { data: foods, isLoading, error } = useQuery(foodsQueryOptions);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['foods'] });

  function openCreate() {
    setEditingFood(null);
    setFormOpen(true);
  }

  function openEdit(food: Food) {
    setEditingFood(food);
    setFormOpen(true);
  }

  function openDelete(food: Food) {
    setDeletingFood(food);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Food Catalogue</h2>
        <Button onClick={openCreate}>
          <Plus />
          Add Food
        </Button>
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
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <FoodsTableBody
              foods={foods}
              isLoading={isLoading}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </TableBody>
        </Table>
      </div>

      <FoodFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        food={editingFood}
        onSaved={invalidate}
      />

      <FoodDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        food={deletingFood}
        onDeleted={invalidate}
      />
    </div>
  );
}

function FoodsTableBody({
  foods,
  isLoading,
  onEdit,
  onDelete,
}: {
  foods: Food[] | undefined;
  isLoading: boolean;
  onEdit: (food: Food) => void;
  onDelete: (food: Food) => void;
}) {
  if (isLoading) {
    return Array.from({ length: 5 }).map((_, i) => (
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
        <TableCell />
      </TableRow>
    ));
  }

  if (foods?.length === 0) {
    return (
      <TableRow>
        <TableCell
          colSpan={4}
          className="h-24 text-center text-muted-foreground"
        >
          No foods found.
        </TableCell>
      </TableRow>
    );
  }

  return foods?.map((food) => (
    <TableRow key={food.id}>
      <TableCell className="font-medium">{food.name}</TableCell>
      <TableCell>
        {food.typeName && <Badge variant="secondary">{food.typeName}</Badge>}
      </TableCell>
      <TableCell className="text-right">{formatPrice(food.price)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => onEdit(food)}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => onDelete(food)}>
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ));
}

type FoodFormData = {
  name: string;
  price: string;
  typeId: string;
};

const emptyForm: FoodFormData = { name: '', price: '', typeId: '' };

function toFormData(food: Food): FoodFormData {
  return {
    name: food.name,
    price: (food.price / 100).toFixed(2),
    typeId: food.typeId,
  };
}

function isValidPrice(value: string): boolean {
  const parsed = parseFloat(value);
  return value !== '' && !isNaN(parsed) && parsed >= 0;
}

function isFoodFormValid(form: FoodFormData): boolean {
  return (
    form.name.trim() !== '' && isValidPrice(form.price) && form.typeId !== ''
  );
}

function FoodFormDialog({
  open,
  onOpenChange,
  food,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: Food | null;
  onSaved: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <FoodFormContent
            food={food}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FoodFormContent({
  food,
  onOpenChange,
  onSaved,
}: {
  food: Food | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const { data: foodTypes } = useQuery(foodTypesQueryOptions);
  const [form, setForm] = useState<FoodFormData>(
    food ? toFormData(food) : emptyForm,
  );

  const createMutation = useMutation({
    mutationFn: createFood,
    onSuccess: () => {
      void onSaved();
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateFood>[1];
    }) => updateFood(id, data),
    onSuccess: () => {
      void onSaved();
      onOpenChange(false);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const priceGrosze = Math.round(parseFloat(form.price) * 100);

    if (food) {
      updateMutation.mutate({
        id: food.id,
        data: { name: form.name, price: priceGrosze, typeId: form.typeId },
      });
    } else {
      createMutation.mutate({
        name: form.name,
        price: priceGrosze,
        typeId: form.typeId,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{food ? 'Edit Food' : 'Add Food'}</DialogTitle>
        <DialogDescription>
          {food
            ? 'Update the food item details.'
            : 'Add a new food item to the catalogue.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Margherita"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Price (PLN)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="e.g. 15.00"
          />
        </div>
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select
            value={form.typeId}
            onValueChange={(v) => setForm((f) => ({ ...f, typeId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {foodTypes?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={!isFoodFormValid(form) || isSaving}>
          {isSaving ? 'Saving...' : food ? 'Save Changes' : 'Add Food'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FoodDeleteDialog({
  open,
  onOpenChange,
  food,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: Food | null;
  onDeleted: () => Promise<void>;
}) {
  const deleteMutation = useMutation({
    mutationFn: deleteFood,
    onSuccess: () => {
      void onDeleted();
      onOpenChange(false);
    },
  });

  function handleOpenChange(value: boolean) {
    onOpenChange(value);
    if (!value) deleteMutation.reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Food</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{food?.name}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteMutation.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {deleteMutation.error instanceof ApiError &&
            deleteMutation.error.status === 409
              ? 'This food cannot be deleted because it is referenced by existing orders or wishlists.'
              : 'Something went wrong. Please try again.'}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => food && deleteMutation.mutate(food.id)}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
