import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { UserFormModal } from '@/components/modals/UserFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUsers } from '@/hooks/useUsers';
import { User, SearchUserDto, UserFormData } from '@/types/user';
import { userApi } from '@/services/userApi';
import { ColumnDef } from '@/types/pagination';
import { useToast } from '@/hooks/use-toast';

export default function UserManagement() {
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [viewingItem, setViewingItem] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const { toast } = useToast();

  const {
    data,
    loading,
    error,
    searchParams,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleSearch,
    handleReset,
    refresh,
  } = useUsers();

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKeyword(value);
      handleSearch(value);
    },
    [handleSearch]
  );

  const handleColumnFilter = useCallback(
    (filters: Record<string, any>) => {
      handleFilter(filters as Partial<SearchUserDto>);
    },
    [handleFilter]
  );

  const handleResetClick = useCallback(() => {
    setKeyword('');
    handleReset();
  }, [handleReset]);

  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  const handleView = useCallback((item: User) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: User) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setDeletingId(id);
    setIsDeleteAlertOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await userApi.delete(deletingId);
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: 'default',
      });
      refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: 'destructive',
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setDeletingId(null);
    }
  };

  const handleFormSubmit = async (formData: UserFormData) => {
    try {
      if (editingItem && editingItem.id) {
        await userApi.update(editingItem.id, formData);
        toast({
          title: "Success",
          description: "User updated successfully",
          variant: 'default',
        });
      } else {
        await userApi.create(formData);
        toast({
          title: "Success",
          description: "User created successfully",
          variant: 'default',
        });
      }
      refresh();
      setIsModalOpen(false);
    } catch (error: any) {
      // Display error message from backend
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi",
        variant: 'destructive',
      });
      throw error; // Re-throw to stop modal loading
    }
  };

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        key: 'actions',
        header: 'Hành động',
        render: (_, item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleView(item); }} title="Xem">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50" onClick={(e) => { e.stopPropagation(); handleEdit(item); }} title="Sửa">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }} title="Xóa">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
      {
        key: 'username',
        header: 'Username',
        sortable: true,
        sortKey: 'username',
        filterable: true,
        filterType: 'text',
        filterKey: 'username',
      },
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        sortKey: 'email',
        filterable: true,
        filterType: 'text',
        filterKey: 'email',
      },
      {
        key: 'roles',
        header: 'Roles',
        render: (_, item) => (
          <div className="flex flex-wrap gap-1">
            {item.roles?.map(role => (
              <span key={role.id} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                {role.name}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created At',
        sortable: true,
        sortKey: 'createdAt',
        render: (value) => value ? new Date(value).toLocaleDateString() : '',
      },
    ],
    [handleView, handleEdit, handleDeleteClick]
  );

  return (
    <div className="flex h-full flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and their roles.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search users..."
          value={keyword}
          onChange={handleKeywordChange}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          className="shrink-0"
          onClick={refresh}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={handleResetClick}
        >
          Reset
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden rounded-md border">
        <DataTable<User>
          data={data}
          columns={columns}
          loading={loading}
          sortBy={searchParams.sortBy || 'createdAt'}
          sortDirection={searchParams.sortDirection || 'DESC'}
          onSort={handleSort}
          onFilter={handleColumnFilter}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowClick={handleEdit}
          rowKey="id"
        />
      </div>

      <UserFormModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        user={viewingItem}
        onSubmit={async () => { }}
        mode="view"
      />

      <UserFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        user={editingItem}
        onSubmit={handleFormSubmit}
        mode={editingItem ? 'edit' : 'create'}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
