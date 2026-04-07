'use client';

import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  MoreHorizontal, Download, Trash2, FileText, Image, Loader2,
} from 'lucide-react';
import { Employee } from '@/lib/validations/employee';
import { deleteEmployee } from '@/actions/employees';

interface EmployeeTableProps {
  employees: Employee[];
  onDelete?: () => void;
}

export function EmployeeTable({ employees, onDelete }: EmployeeTableProps) {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const downloadDocument = async (url?: string, documentName?: string) => {
    if (!url) {
      toast({
        title: 'No Document',
        description: 'This document is not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = documentName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: `${documentName} downloaded successfully`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee?.id) return;

    setIsDeleting(true);
    try {
      const result = await deleteEmployee(selectedEmployee.id);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Employee deleted successfully',
          duration: 2000,
        });
        onDelete?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete employee',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setSelectedEmployee(null);
    }
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-900">Name</TableHead>
              <TableHead className="font-semibold text-slate-900">Position</TableHead>
              <TableHead className="font-semibold text-slate-900">Iqama Number</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="font-semibold text-slate-900">Added Date</TableHead>
              <TableHead className="font-semibold text-slate-900">Documents</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {employee.name}
                  </TableCell>
                  <TableCell className="text-slate-600">{employee.position}</TableCell>
                  <TableCell className="text-slate-600">{employee.iqamaNumber}</TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.status === 'active' ? 'default' : 'secondary'}
                      className={
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(employee.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {employee.iqamaDocumentUrl && (
                        <button
                          onClick={() => downloadDocument(employee.iqamaDocumentUrl, `${employee.name}-iqama`)}
                          className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                          title="Download Iqama"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                      {employee.passportDocumentUrl && (
                        <button
                          onClick={() => downloadDocument(employee.passportDocumentUrl, `${employee.name}-passport`)}
                          className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                          title="Download Passport"
                        >
                          <FileText className="w-4 h-4 text-purple-600" />
                        </button>
                      )}
                      {employee.photoUrl && (
                        <button
                          onClick={() => downloadDocument(employee.photoUrl, `${employee.name}-photo`)}
                          className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                          title="Download Photo"
                        >
                          <Image className="w-4 h-4 text-amber-600" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {employee.iqamaDocumentUrl && (
                          <DropdownMenuItem
                            onClick={() => downloadDocument(employee.iqamaDocumentUrl, `${employee.name}-iqama`)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Iqama
                          </DropdownMenuItem>
                        )}
                        {employee.passportDocumentUrl && (
                          <DropdownMenuItem
                            onClick={() => downloadDocument(employee.passportDocumentUrl, `${employee.name}-passport`)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Passport
                          </DropdownMenuItem>
                        )}
                        {employee.photoUrl && (
                          <DropdownMenuItem
                            onClick={() => downloadDocument(employee.photoUrl, `${employee.name}-photo`)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Photo
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSelectedEmployee(employee)}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedEmployee?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
