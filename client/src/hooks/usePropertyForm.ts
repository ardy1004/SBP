/**
 * Hook for managing property form state and submission
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { PropertyFormData, OwnerData, AgreementData } from '@/components/admin/property-form/types';
import { DEFAULT_FORM_DATA } from '@/components/admin/property-form/constants';
import { generateListingCode, buildPropertyPayload, parsePropertyToFormData, validateForm } from '@/components/admin/property-form/utils';

interface UsePropertyFormOptions {
  property?: any;
  sourceInput: 'ADMIN' | 'OWNER';
  onSuccess?: (propertyId: string, goToComplete?: boolean) => void;
}

interface UsePropertyFormReturn {
  formData: PropertyFormData;
  isSubmitting: boolean;
  submittedProperties: string[];
  showAddAnother: boolean;
  handleChange: (field: keyof PropertyFormData, value: any) => void;
  handlePriceChange: (field: keyof PropertyFormData, value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleReset: () => void;
  handleAddAnother: () => void;
  generateNewKode: () => void;
  validate: () => { valid: boolean; message?: string };
}

export function usePropertyForm(options: UsePropertyFormOptions): UsePropertyFormReturn {
  const { property, sourceInput, onSuccess } = options;
  const { toast } = useToast();

  const [formData, setFormData] = useState<PropertyFormData>(() => {
    if (property?.id) {
      return parsePropertyToFormData(property, sourceInput);
    }
    return {
      ...DEFAULT_FORM_DATA,
      source_input: sourceInput,
      publish_status: sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED',
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProperties, setSubmittedProperties] = useState<string[]>([]);
  const [showAddAnother, setShowAddAnother] = useState(false);

  // Update form when property prop changes
  useEffect(() => {
    if (property?.id) {
      setFormData(parsePropertyToFormData(property, sourceInput));
    }
  }, [property?.id, sourceInput]);

  // Auto-generate kode listing on mount if not editing
  useEffect(() => {
    if (!property?.id && !formData.kode_listing) {
      const uniqueCode = generateListingCode();
      handleChange('kode_listing', uniqueCode);
    }
  }, []);

  const handleChange = useCallback((field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePriceChange = useCallback((field: keyof PropertyFormData, value: string) => {
    const parsed = value.replace(/[^\d]/g, '');
    handleChange(field, parsed);
  }, [handleChange]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate
    const validation = validateForm(formData);
    if (!validation.valid) {
      toast({
        title: "Validasi Gagal",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPropertyPayload(formData);

      let result;
      if (property?.id) {
        result = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('properties')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const newPropertyId = result.data?.id;
      if (newPropertyId) {
        setSubmittedProperties(prev => [...prev, newPropertyId]);
      }

      toast({
        title: "Berhasil",
        description: sourceInput === 'OWNER'
          ? "Properti berhasil diajukan, tunggu persetujuan admin"
          : "Properti berhasil disimpan",
        duration: 5000
      });

      setShowAddAnother(true);

      if (onSuccess && sourceInput === 'ADMIN') {
        onSuccess(result.data?.id, true);
      }
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan properti",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, property?.id, sourceInput, onSuccess, toast]);

  const handleReset = useCallback(() => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      source_input: sourceInput,
      publish_status: sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED',
    });
    setShowAddAnother(false);
    setSubmittedProperties([]);
  }, [sourceInput]);

  const handleAddAnother = useCallback(() => {
    const newKode = generateListingCode();
    
    setFormData(prev => ({
      ...DEFAULT_FORM_DATA,
      kode_listing: newKode,
      provinsi: prev.provinsi,
      kabupaten: prev.kabupaten,
      kecamatan: prev.kecamatan,
      kelurahan: prev.kelurahan,
      source_input: sourceInput,
      publish_status: sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED',
    }));
    
    setShowAddAnother(false);
    
    toast({
      title: "Form Properti Baru",
      description: `Properti ke-${submittedProperties.length + 2} - Isi data properti baru`,
      duration: 3000
    });
  }, [sourceInput, submittedProperties.length, toast]);

  const generateNewKode = useCallback(() => {
    const newKode = generateListingCode();
    handleChange('kode_listing', newKode);
  }, [handleChange]);

  const validate = useCallback(() => {
    return validateForm(formData);
  }, [formData]);

  return {
    formData,
    isSubmitting,
    submittedProperties,
    showAddAnother,
    handleChange,
    handlePriceChange,
    handleSubmit,
    handleReset,
    handleAddAnother,
    generateNewKode,
    validate,
  };
}

export default usePropertyForm;