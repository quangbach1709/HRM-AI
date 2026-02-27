import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Eye, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { UserRoleFormModal } from '@/components/modals/UserRoleFormModal';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UserRole, SearchUserRoleDto } from '@/types/role';
import { userRoleApi } from '@/services/userRoleApi';
import { ColumnDef } from '@/types/pagination';
import { useToast } from '@/hooks/use-toast';

export default function UserRoleManagement() {
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
  } = useUserRoles();

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKeyword(value);
      handleSearch(value);
    },
    [handleSearch]
  );

  const handleResetClick = useCallback(() => {
    setKeyword('');
    handleReset();
  }, [handleReset]);

  const handleCreate = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this role assignment?')) return;

    setDeletingId(id);
    try {
      await userRoleApi.delete(id);
      toast({
        title: "Success",
        description: "Role assignment removed successfully",
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
      setDeletingId(null);
    }
  }, [refresh, toast]);

  const handleFormSubmit = async (dto: SearchUserRoleDto) => {
    try {
      await userRoleApi.create(dto);
      toast({
        title: "Success",
        description: "Role assigned successfully",
        variant: 'default',
      });
      refresh();
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: 'destructive',
      });
      // Rethrow not strictly needed here as toast handles it, but modal handles loading state
      // Let's rethrow to stop modal loading 
      throw error;
    }
  };

  const columns: ColumnDef<UserRole>[] = useMemo(
    () => [
      {
        key: 'actions',
        header: 'Hành động',
        render: (_, item) => (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Xóa
            </Button>
          </div>
        ),
      },
      {
        key: 'user.username',
        header: 'User',
        sortable: false,
        render: (_, item) => item.user?.username || '-',
      },
      {
        key: 'role.name',
        header: 'Role',
        sortable: false,
        render: (_, item) => item.role?.name || '-',
      },
      {
        key: 'createdAt',
        header: 'Assigned At',
        sortable: true,
        sortKey: 'createdAt',
        render: (value) => value ? new Date(value).toLocaleDateString() : '',
      },
    ],
    [handleDelete, deletingId]
  );

  return (
    <div className="flex h-full flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Role Assignments</h2>
          <p className="text-muted-foreground">
            Manage role assignments to users.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Role
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search user or role..."
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
        <DataTable<UserRole>
          data={data}
          columns={columns}
          loading={loading}
          sortBy={searchParams.sortBy || 'createdAt'}
          sortDirection={searchParams.sortDirection || 'DESC'}
          onSort={handleSort}
          onFilter={() => { }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowKey="id"
        />
      </div>

      <UserRoleFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
