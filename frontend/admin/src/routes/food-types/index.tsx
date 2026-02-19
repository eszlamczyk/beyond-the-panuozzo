import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  foodTypesQueryOptions,
  createFoodType,
  updateFoodType,
  deleteFoodType,
} from '@/api/foods';
import { ApiError } from '@/api/client';
import type { FoodType } from '@/api/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Pencil, Plus, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/food-types/')({
  component: FoodTypesPage,
});

function FoodTypesPage() {
  const queryClient = useQueryClient();
  const { data: foodTypes, isLoading, error } = useQuery(foodTypesQueryOptions);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingType, setEditingType] = useState<FoodType | null>(null);
  const [deletingType, setDeletingType] = useState<FoodType | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['foodTypes'] });

  function openCreate() {
    setEditingType(null);
    setFormOpen(true);
  }

  function openEdit(ft: FoodType) {
    setEditingType(ft);
    setFormOpen(true);
  }

  function openDelete(ft: FoodType) {
    setDeletingType(ft);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Food Types</h2>
        <Button onClick={openCreate}>
          <Plus />
          Add Type
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load food types.
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <FoodTypesTableBody
              foodTypes={foodTypes}
              isLoading={isLoading}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </TableBody>
        </Table>
      </div>

      <FoodTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        foodType={editingType}
        onSaved={invalidate}
      />

      <FoodTypeDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        foodType={deletingType}
        onDeleted={invalidate}
      />
    </div>
  );
}

function FoodTypesTableBody({
  foodTypes,
  isLoading,
  onEdit,
  onDelete,
}: {
  foodTypes: FoodType[] | undefined;
  isLoading: boolean;
  onEdit: (ft: FoodType) => void;
  onDelete: (ft: FoodType) => void;
}) {
  if (isLoading) {
    return Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell />
      </TableRow>
    ));
  }

  if (foodTypes?.length === 0) {
    return (
      <TableRow>
        <TableCell
          colSpan={2}
          className="h-24 text-center text-muted-foreground"
        >
          No food types found.
        </TableCell>
      </TableRow>
    );
  }

  return foodTypes?.map((ft) => (
    <TableRow key={ft.id}>
      <TableCell className="font-medium">{ft.type}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => onEdit(ft)}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => onDelete(ft)}>
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ));
}

function FoodTypeFormDialog({
  open,
  onOpenChange,
  foodType,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodType: FoodType | null;
  onSaved: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <FoodTypeFormContent
            foodType={foodType}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FoodTypeFormContent({
  foodType,
  onOpenChange,
  onSaved,
}: {
  foodType: FoodType | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [typeName, setTypeName] = useState(foodType?.type ?? '');

  const createMutation = useMutation({
    mutationFn: createFoodType,
    onSuccess: () => {
      void onSaved();
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { type: string } }) =>
      updateFoodType(id, data),
    onSuccess: () => {
      void onSaved();
      onOpenChange(false);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isFormValid = typeName.trim() !== '';

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (foodType) {
      updateMutation.mutate({ id: foodType.id, data: { type: typeName } });
    } else {
      createMutation.mutate({ type: typeName });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {foodType ? 'Edit Food Type' : 'Add Food Type'}
        </DialogTitle>
        <DialogDescription>
          {foodType ? 'Update the food type name.' : 'Add a new food type.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Type name</Label>
          <Input
            id="type"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="e.g. Pizza"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={!isFormValid || isSaving}>
          {isSaving ? 'Saving...' : foodType ? 'Save Changes' : 'Add Type'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FoodTypeDeleteDialog({
  open,
  onOpenChange,
  foodType,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodType: FoodType | null;
  onDeleted: () => Promise<void>;
}) {
  const deleteMutation = useMutation({
    mutationFn: deleteFoodType,
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
          <DialogTitle>Delete Food Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{foodType?.type}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteMutation.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {deleteMutation.error instanceof ApiError &&
            deleteMutation.error.status === 409
              ? 'This food type cannot be deleted because it still has foods associated with it.'
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
            onClick={() => foodType && deleteMutation.mutate(foodType.id)}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
