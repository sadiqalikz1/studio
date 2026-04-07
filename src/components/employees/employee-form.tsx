'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema, type CreateEmployee } from '@/lib/validations/employee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { employeesService } from '@/lib/api/services';

interface EmployeeFormProps {
  onSuccess?: () => void;
}

export function EmployeeForm({ onSuccess }: EmployeeFormProps) {
  const { toast } = useToast();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: { loaded: number; total: number };
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{
    photo?: string;
    iqama?: string;
    passport?: string;
  }>({});

  const form = useForm<CreateEmployee>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      iqamaNumber: '',
      iqamaExpiry: '',
      passportNumber: '',
      passportExpiry: '',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleFileUpload = async (
    file: File,
    fileType: 'photo' | 'iqama' | 'passport'
  ) => {
    if (!file) return null;

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `employees/${fileType}/${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, storagePath);

      setUploadProgress((prev) => ({
        ...prev,
        [fileType]: { loaded: 0, total: file.size },
      }));

      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: downloadUrl,
      }));

      form.setValue(
        fileType === 'photo'
          ? 'photoUrl'
          : fileType === 'iqama'
            ? 'iqamaDocumentUrl'
            : 'passportDocumentUrl',
        downloadUrl
      );

      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileType];
        return newProgress;
      });

      toast({
        title: 'Success',
        description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`,
        duration: 3000,
      });

      return downloadUrl;
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast({
        title: 'Error',
        description: `Failed to upload ${fileType}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  const onSubmit = async (data: CreateEmployee) => {
    setIsSubmitting(true);
    try {
      // Use the employees service from services.ts
      const result = await employeesService.createEmployee(data);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Employee created successfully',
          duration: 3000,
        });
        form.reset();
        setUploadedFiles({});
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create employee',
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
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Employee</CardTitle>
        <CardDescription>Add a new employee to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter job position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Iqama Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-900">Iqama (Saudi ID)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="iqamaNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iqama Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Iqama number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="iqamaExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iqama Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Iqama Document</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'iqama');
                    }}
                    disabled={uploadProgress['iqama'] !== undefined}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Supported: Images (JPG, PNG, etc.) or PDF
                  </p>
                  {uploadedFiles.iqama && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Document uploaded</span>
                    </div>
                  )}
                  {uploadProgress['iqama'] && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Passport Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-900">Passport</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter passport number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passportExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Passport Document</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'passport');
                    }}
                    disabled={uploadProgress['passport'] !== undefined}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Supported: Images (JPG, PNG, etc.) or PDF
                  </p>
                  {uploadedFiles.passport && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Document uploaded</span>
                    </div>
                  )}
                  {uploadProgress['passport'] && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photo */}
            <div className="space-y-2">
              <Label>Employee Photo</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'photo');
                  }}
                  disabled={uploadProgress['photo'] !== undefined}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">Supported: JPG, PNG, etc.</p>
                {uploadedFiles.photo && (
                  <div className="flex items-center gap-2 mt-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Photo uploaded</span>
                  </div>
                )}
                {uploadProgress['photo'] && (
                  <div className="flex items-center gap-2 mt-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 w-4 h-4" />
                    Create Employee
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
